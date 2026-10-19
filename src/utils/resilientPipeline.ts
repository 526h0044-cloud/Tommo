/**
 * Tommo 1.0 — High-Performance Resilient System Pipeline
 * Architectural Principles:
 * 1. Comprehensive Error Boundary Pattern (Typed errors, isolated contexts, fallback execution)
 * 2. Zero-Side-Effects Input Validation (Pre-flight validation & defensive deep cloning)
 * 3. Robust Retry Mechanism with Full Exponential Jitter (Thundering Herd Mitigation)
 * 4. Advanced Circuit Breaker with Half-Open Success Threshold & Timer Cleanup
 */

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface PipelineErrorContext {
  traceId: string;
  attempt: number;
  maxRetries: number;
  durationMs: number;
  circuitState: CircuitBreakerState;
  isRetryable: boolean;
}

export interface PipelineMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  retryAttempts: number;
  circuitBreakerTrips: number;
  currentCircuitState: CircuitBreakerState;
}

export interface ResilientPipelineConfig<T, R> {
  timeoutMs?: number;
  maxRetries?: number;
  backoffInitialMs?: number;
  backoffFactor?: number;
  backoffMaxMs?: number;
  circuitThreshold?: number;
  circuitResetTimeoutMs?: number;
  halfOpenSuccessThreshold?: number;
  validatePayload?: (payload: T) => ValidationResult | boolean | void;
  isRetryable?: (error: unknown, attempt: number) => boolean;
  fallback?: (payload: T, error: unknown, context: PipelineErrorContext) => R | Promise<R>;
  onError?: (error: unknown, context: PipelineErrorContext) => void;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
  onCircuitStateChange?: (state: CircuitBreakerState) => void;
}

// ==========================================
// Error Boundary Hierarchy
// ==========================================

export class PipelineError extends Error {
  public readonly isPipelineError = true;
  constructor(message: string) {
    super(message);
    this.name = 'PipelineError';
  }
}

export class ValidationError extends PipelineError {
  constructor(message = 'Input payload failed pipeline pre-flight validation.') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CircuitBreakerOpenError extends PipelineError {
  constructor(message = 'Circuit Breaker OPEN: Dịch vụ đang tự bảo vệ để phục hồi.') {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class PipelineTimeoutError extends PipelineError {
  public readonly timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = 'PipelineTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class NonRetryableError extends PipelineError {
  constructor(message = 'Non-retryable operational error encountered.') {
    super(message);
    this.name = 'NonRetryableError';
  }
}

export class PipelineExecutionError extends PipelineError {
  public readonly cause: unknown;
  public readonly context: PipelineErrorContext;

  constructor(cause: unknown, context: PipelineErrorContext) {
    const causeMsg = cause instanceof Error ? cause.message : String(cause);
    super(`Pipeline execution failed after ${context.attempt} attempts: ${causeMsg}`);
    this.name = 'PipelineExecutionError';
    this.cause = cause;
    this.context = context;
  }
}

// ==========================================
// Zero-Side-Effects Cloning Helper
// ==========================================

function deepClonePayload<T>(payload: T): T {
  if (payload === null || typeof payload !== 'object') {
    return payload;
  }

  // Use structuredClone when supported
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(payload);
    } catch {
      // Fallback for non-cloneable objects (functions, symbols)
    }
  }

  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    // Defensive shallow copy fallback
    if (Array.isArray(payload)) {
      return [...payload] as unknown as T;
    }
    return { ...payload };
  }
}

// ==========================================
// Core Resilient System Pipeline
// ==========================================

export class ResilientSystemPipeline<T, R> {
  private readonly handler: (payload: T, signal?: AbortSignal) => Promise<R>;

  private circuitState: CircuitBreakerState = 'CLOSED';
  private consecutiveFailures = 0;
  private consecutiveSuccessesInHalfOpen = 0;
  private circuitResetTimer: ReturnType<typeof setTimeout> | null = null;

  // Configuration options
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffInitialMs: number;
  private readonly backoffFactor: number;
  private readonly backoffMaxMs: number;
  private readonly circuitThreshold: number;
  private readonly circuitResetTimeoutMs: number;
  private readonly halfOpenSuccessThreshold: number;

  private readonly validatePayload?: (payload: T) => ValidationResult | boolean | void;
  private readonly isRetryableFilter?: (error: unknown, attempt: number) => boolean;
  private readonly fallback?: (payload: T, error: unknown, context: PipelineErrorContext) => R | Promise<R>;
  private readonly onError?: (error: unknown, context: PipelineErrorContext) => void;
  private readonly onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
  private readonly onCircuitStateChange?: (state: CircuitBreakerState) => void;

  // Telemetry metrics
  private totalCalls = 0;
  private successfulCalls = 0;
  private failedCalls = 0;
  private retryAttempts = 0;
  private circuitBreakerTrips = 0;

  constructor(
    handler: (payload: T, signal?: AbortSignal) => Promise<R>,
    config?: ResilientPipelineConfig<T, R>
  ) {
    this.handler = handler;
    this.timeoutMs = config?.timeoutMs ?? 3000;
    this.maxRetries = config?.maxRetries ?? 2;
    this.backoffInitialMs = config?.backoffInitialMs ?? 100;
    this.backoffFactor = config?.backoffFactor ?? 2;
    this.backoffMaxMs = config?.backoffMaxMs ?? 5000;
    this.circuitThreshold = config?.circuitThreshold ?? 3;
    this.circuitResetTimeoutMs = config?.circuitResetTimeoutMs ?? 8000;
    this.halfOpenSuccessThreshold = config?.halfOpenSuccessThreshold ?? 2;

    this.validatePayload = config?.validatePayload;
    this.isRetryableFilter = config?.isRetryable;
    this.fallback = config?.fallback;
    this.onError = config?.onError;
    this.onRetry = config?.onRetry;
    this.onCircuitStateChange = config?.onCircuitStateChange;
  }

  public getCircuitState(): CircuitBreakerState {
    return this.circuitState;
  }

  public getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  public getMetrics(): PipelineMetrics {
    return {
      totalCalls: this.totalCalls,
      successfulCalls: this.successfulCalls,
      failedCalls: this.failedCalls,
      retryAttempts: this.retryAttempts,
      circuitBreakerTrips: this.circuitBreakerTrips,
      currentCircuitState: this.circuitState,
    };
  }

  public resetCircuit(): void {
    if (this.circuitResetTimer) {
      clearTimeout(this.circuitResetTimer);
      this.circuitResetTimer = null;
    }
    this.consecutiveFailures = 0;
    this.consecutiveSuccessesInHalfOpen = 0;
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
    this.circuitBreakerTrips++;
    this.setCircuitState('OPEN');
    if (this.circuitResetTimer) {
      clearTimeout(this.circuitResetTimer);
    }
    this.circuitResetTimer = setTimeout(() => {
      this.consecutiveSuccessesInHalfOpen = 0;
      this.setCircuitState('HALF_OPEN');
      this.circuitResetTimer = null;
    }, this.circuitResetTimeoutMs);
  }

  /**
   * Evaluates whether an error should trigger an automatic retry.
   */
  private determineRetryable(error: unknown, attempt: number): boolean {
    if (this.isRetryableFilter) {
      return this.isRetryableFilter(error, attempt);
    }

    if (error instanceof ValidationError) return false;
    if (error instanceof CircuitBreakerOpenError) return false;
    if (error instanceof NonRetryableError) return false;

    // Abort errors should never be retried
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
      return false;
    }

    // Default: timeouts, network drops, 5xx are retryable
    return true;
  }

  /**
   * Main execution pipeline with zero-side-effects input validation,
   * comprehensive error boundaries, and exponential jitter retries.
   */
  async process(payload: T, externalSignal?: AbortSignal): Promise<R> {
    this.totalCalls++;
    const startTime = Date.now();
    const traceId = `pipe-${startTime}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Zero-Side-Effects Pre-Flight Validation
    // Executed before touching circuit breakers, network, or allocating retry timers
    if (this.validatePayload) {
      try {
        const valRes = this.validatePayload(payload);
        if (valRes === false) {
          throw new ValidationError('Input payload failed validation constraint.');
        } else if (typeof valRes === 'object' && valRes !== null && valRes.valid === false) {
          throw new ValidationError(valRes.reason || 'Input payload failed validation constraint.');
        }
      } catch (valErr: unknown) {
        this.failedCalls++;
        const error = valErr instanceof ValidationError ? valErr : new ValidationError(String(valErr));
        const errorContext: PipelineErrorContext = {
          traceId,
          attempt: 0,
          maxRetries: this.maxRetries,
          durationMs: Date.now() - startTime,
          circuitState: this.circuitState,
          isRetryable: false,
        };
        this.onError?.(error, errorContext);

        if (this.fallback) {
          return await this.fallback(payload, error, errorContext);
        }
        throw error;
      }
    }

    // 2. Circuit Breaker Fast-Fail Check
    if (this.circuitState === 'OPEN') {
      const error = new CircuitBreakerOpenError();
      const errorContext: PipelineErrorContext = {
        traceId,
        attempt: 0,
        maxRetries: this.maxRetries,
        durationMs: Date.now() - startTime,
        circuitState: this.circuitState,
        isRetryable: false,
      };
      this.failedCalls++;
      this.onError?.(error, errorContext);

      if (this.fallback) {
        return await this.fallback(payload, error, errorContext);
      }
      throw error;
    }

    let lastError: unknown;

    // 3. Robust Execution Loop with Jittered Backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (externalSignal?.aborted) {
        const abortErr = new Error('Operation aborted by caller');
        this.failedCalls++;
        throw abortErr;
      }

      const internalController = new AbortController();
      let timerId: ReturnType<typeof setTimeout> | undefined;

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

      // Defensive Deep-Clone ensures ZERO SIDE-EFFECTS on the caller's payload,
      // even if the handler mutates its argument during execution attempts.
      const safeIsolatedPayload = deepClonePayload(payload);

      try {
        const result = await Promise.race([
          this.handler(safeIsolatedPayload, internalController.signal),
          timeoutPromise,
        ]);

        // Success: Transition circuit states
        this.successfulCalls++;
        this.consecutiveFailures = 0;

        if (this.circuitState === 'HALF_OPEN') {
          this.consecutiveSuccessesInHalfOpen++;
          if (this.consecutiveSuccessesInHalfOpen >= this.halfOpenSuccessThreshold) {
            this.setCircuitState('CLOSED');
            this.consecutiveSuccessesInHalfOpen = 0;
          }
        }

        return result;
      } catch (err: unknown) {
        lastError = err;
        this.consecutiveFailures++;

        const isRetryable = this.determineRetryable(err, attempt);

        // Immediate circuit breaker trip in HALF_OPEN or when reaching threshold
        if (
          this.circuitState === 'HALF_OPEN' ||
          this.consecutiveFailures >= this.circuitThreshold
        ) {
          this.triggerCircuitOpen();
          break; // Halt further attempts when circuit trips
        }

        if (!isRetryable || attempt >= this.maxRetries) {
          break; // Stop immediately for non-retryable errors or retry exhaustion
        }

        this.retryAttempts++;

        // Exponential backoff with random full jitter to prevent thundering herds
        const rawBackoff = this.backoffInitialMs * Math.pow(this.backoffFactor, attempt);
        const jitter = Math.random() * (rawBackoff * 0.5);
        const delayMs = Math.min(this.backoffMaxMs, Math.floor(rawBackoff + jitter));

        this.onRetry?.(attempt + 1, err, delayMs);

        await new Promise(resolve => setTimeout(resolve, delayMs));
      } finally {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort);
        }
      }
    }

    // 4. Error Boundary Envelope & Graceful Fallback
    this.failedCalls++;
    const executionContext: PipelineErrorContext = {
      traceId,
      attempt: this.maxRetries + 1,
      maxRetries: this.maxRetries,
      durationMs: Date.now() - startTime,
      circuitState: this.circuitState,
      isRetryable: false,
    };

    const finalError =
      lastError instanceof PipelineError
        ? lastError
        : new PipelineExecutionError(lastError, executionContext);

    this.onError?.(finalError, executionContext);

    if (this.fallback) {
      return await this.fallback(payload, finalError, executionContext);
    }

    throw finalError;
  }
}
