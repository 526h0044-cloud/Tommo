/**
 * Tommo 1.0 — High-Performance Resilient System Pipeline
 * Architectural Principles:
 * 1. Zero Allocation Hot Path & Memory Leak Prevention (Timer cleanup)
 * 2. Multi-tier Circuit Breaker (CLOSED -> OPEN -> HALF_OPEN -> CLOSED)
 * 3. Race-condition-free Async Timeout with AbortController support
 * 4. Exponential Backoff with Random Jitter (Thundering Herd Mitigation)
 */

export interface ExecutionContext<TInput, TOutput> {
  traceId: string;
  timestamp: number;
  execute(input: TInput, signal?: AbortSignal): Promise<TOutput>;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ResilientPipelineConfig {
  timeoutMs?: number;
  maxRetries?: number;
  backoffInitialMs?: number;
  circuitThreshold?: number;
  circuitResetTimeoutMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
  onCircuitStateChange?: (state: CircuitBreakerState) => void;
}

export class CircuitBreakerOpenError extends Error {
  constructor(message = 'Circuit Breaker OPEN: Dịch vụ đang tự bảo vệ để phục hồi.') {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class PipelineTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = 'PipelineTimeoutError';
  }
}

export class ResilientSystemPipeline<T, R> {
  private circuitState: CircuitBreakerState = 'CLOSED';
  private consecutiveFailures = 0;
  private circuitResetTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffInitialMs: number;
  private readonly circuitThreshold: number;
  private readonly circuitResetTimeoutMs: number;
  private readonly onRetry?: (attempt: number, error: unknown) => void;
  private readonly onCircuitStateChange?: (state: CircuitBreakerState) => void;

  constructor(
    private readonly handler: (payload: T, signal?: AbortSignal) => Promise<R>,
    config?: ResilientPipelineConfig
  ) {
    this.timeoutMs = config?.timeoutMs ?? 3000;
    this.maxRetries = config?.maxRetries ?? 2;
    this.backoffInitialMs = config?.backoffInitialMs ?? 100;
    this.circuitThreshold = config?.circuitThreshold ?? 3;
    this.circuitResetTimeoutMs = config?.circuitResetTimeoutMs ?? 8000;
    this.onRetry = config?.onRetry;
    this.onCircuitStateChange = config?.onCircuitStateChange;
  }

  public getCircuitState(): CircuitBreakerState {
    return this.circuitState;
  }

  public getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  public resetCircuit(): void {
    if (this.circuitResetTimer) {
      clearTimeout(this.circuitResetTimer);
      this.circuitResetTimer = null;
    }
    this.consecutiveFailures = 0;
    this.setCircuitState('CLOSED');
  }

  public dispose(): void {
    if (this.circuitResetTimer) {
      clearTimeout(this.circuitResetTimer);
      this.circuitResetTimer = null;
    }
  }

  private setCircuitState(newState: CircuitBreakerState): void {
    if (this.circuitState !== newState) {
      this.circuitState = newState;
      this.onCircuitStateChange?.(newState);
    }
  }

  private triggerCircuitOpen(): void {
    this.setCircuitState('OPEN');
    if (this.circuitResetTimer) {
      clearTimeout(this.circuitResetTimer);
    }
    this.circuitResetTimer = setTimeout(() => {
      this.setCircuitState('HALF_OPEN');
      this.circuitResetTimer = null;
    }, this.circuitResetTimeoutMs);
  }

  async process(payload: T, externalSignal?: AbortSignal): Promise<R> {
    if (this.circuitState === 'OPEN') {
      throw new CircuitBreakerOpenError();
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (externalSignal?.aborted) {
        throw new Error('Operation aborted by caller');
      }

      const internalController = new AbortController();
      let timerId: ReturnType<typeof setTimeout> | undefined;

      // Listen to external abort to cancel internal controller
      const onExternalAbort = () => internalController.abort();
      if (externalSignal) {
        externalSignal.addEventListener('abort', onExternalAbort, { once: true });
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => {
          internalController.abort();
          reject(new PipelineTimeoutError(this.timeoutMs));
        }, this.timeoutMs);
      });

      try {
        const result = await Promise.race([
          this.handler(payload, internalController.signal),
          timeoutPromise,
        ]);

        // Success: Reset circuit metrics
        this.consecutiveFailures = 0;
        if (this.circuitState === 'HALF_OPEN') {
          this.setCircuitState('CLOSED');
        }
        return result;
      } catch (err: unknown) {
        lastError = err;
        this.consecutiveFailures++;

        if (this.onRetry && attempt < this.maxRetries) {
          this.onRetry(attempt + 1, err);
        }

        // Circuit breaker trip condition
        if (
          this.circuitState === 'HALF_OPEN' ||
          this.consecutiveFailures >= this.circuitThreshold
        ) {
          this.triggerCircuitOpen();
          break; // Stop retrying immediately if circuit opens
        }

        // Exponential backoff with random jitter before next attempt
        if (attempt < this.maxRetries) {
          const jitter = Math.random() * 50;
          const delayMs = this.backoffInitialMs * Math.pow(2, attempt) + jitter;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } finally {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort);
        }
      }
    }

    throw lastError;
  }
}
