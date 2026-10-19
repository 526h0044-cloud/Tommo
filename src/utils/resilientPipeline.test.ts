import { test } from 'node:test';
import assert from 'node:assert';
import {
  ResilientSystemPipeline,
  CircuitBreakerOpenError,
  PipelineTimeoutError,
  ValidationError,
  NonRetryableError,
  PipelineExecutionError,
} from './resilientPipeline.ts';

test('ResilientSystemPipeline: executes successfully on normal handler', async () => {
  const pipeline = new ResilientSystemPipeline(async (val: number) => {
    return val * 2;
  });

  const result = await pipeline.process(21);
  assert.strictEqual(result, 42);
  assert.strictEqual(pipeline.getCircuitState(), 'CLOSED');
  assert.strictEqual(pipeline.getConsecutiveFailures(), 0);
  pipeline.dispose();
});

test('ResilientSystemPipeline: retries on transient errors and succeeds', async () => {
  let attempts = 0;
  const pipeline = new ResilientSystemPipeline(
    async (val: string) => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Transient network glitch');
      }
      return `Processed: ${val}`;
    },
    { maxRetries: 2, backoffInitialMs: 10 }
  );

  const res = await pipeline.process('hello');
  assert.strictEqual(res, 'Processed: hello');
  assert.strictEqual(attempts, 2);
  assert.strictEqual(pipeline.getCircuitState(), 'CLOSED');
  pipeline.dispose();
});

test('ResilientSystemPipeline: triggers PipelineTimeoutError when handler hangs', async () => {
  const pipeline = new ResilientSystemPipeline(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return 'done';
    },
    { timeoutMs: 50, maxRetries: 0 }
  );

  await assert.rejects(
    async () => {
      await pipeline.process({});
    },
    (err: any) => {
      assert.ok(err instanceof PipelineTimeoutError || err.name === 'PipelineTimeoutError');
      return true;
    }
  );
  pipeline.dispose();
});

test('ResilientSystemPipeline: trips circuit breaker to OPEN after threshold failures', async () => {
  const stateChanges: string[] = [];
  const pipeline = new ResilientSystemPipeline(
    async () => {
      throw new Error('Persistent backend outage');
    },
    {
      maxRetries: 0,
      circuitThreshold: 2,
      circuitResetTimeoutMs: 100,
      onCircuitStateChange: state => stateChanges.push(state),
    }
  );

  // Failure 1
  await assert.rejects(async () => pipeline.process('test'));
  assert.strictEqual(pipeline.getCircuitState(), 'CLOSED');

  // Failure 2 -> Threshold reached -> trips to OPEN
  await assert.rejects(async () => pipeline.process('test'));
  assert.strictEqual(pipeline.getCircuitState(), 'OPEN');

  // Next call fails immediately with CircuitBreakerOpenError without calling handler
  await assert.rejects(
    async () => pipeline.process('test'),
    (err: any) => err instanceof CircuitBreakerOpenError
  );

  // Wait for circuit reset timer to HALF_OPEN
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.strictEqual(pipeline.getCircuitState(), 'HALF_OPEN');

  pipeline.dispose();
});

test('ResilientSystemPipeline: enforces zero-side-effects through defensive isolation', async () => {
  interface MutablePayload {
    data: string;
    items: string[];
    metadata: { counter: number };
  }

  const pipeline = new ResilientSystemPipeline<MutablePayload, string>(
    async (payload) => {
      // Intentionally mutate received payload
      payload.data = 'mutated';
      payload.items.push('danger');
      payload.metadata.counter = 999;
      return 'ok';
    }
  );

  const originalPayload: MutablePayload = {
    data: 'pristine',
    items: ['safe'],
    metadata: { counter: 1 },
  };

  const res = await pipeline.process(originalPayload);
  assert.strictEqual(res, 'ok');

  // Verify caller payload remains untouched (ZERO SIDE-EFFECTS)
  assert.strictEqual(originalPayload.data, 'pristine');
  assert.deepStrictEqual(originalPayload.items, ['safe']);
  assert.strictEqual(originalPayload.metadata.counter, 1);

  pipeline.dispose();
});

test('ResilientSystemPipeline: rejects invalid payloads via pre-flight validation without side-effects', async () => {
  let handlerInvoked = false;

  const pipeline = new ResilientSystemPipeline<{ apiKey?: string }, string>(
    async () => {
      handlerInvoked = true;
      return 'processed';
    },
    {
      validatePayload: (p) => {
        if (!p.apiKey || p.apiKey.length < 5) {
          return { valid: false, reason: 'API key is too short or missing' };
        }
        return true;
      },
    }
  );

  await assert.rejects(
    async () => pipeline.process({ apiKey: 'ab' }),
    (err: any) => {
      assert.ok(err instanceof ValidationError || err.name === 'ValidationError');
      assert.strictEqual(err.message, 'API key is too short or missing');
      return true;
    }
  );

  assert.strictEqual(handlerInvoked, false);
  // Circuit breaker state must NOT be degraded by validation errors
  assert.strictEqual(pipeline.getCircuitState(), 'CLOSED');
  assert.strictEqual(pipeline.getConsecutiveFailures(), 0);

  pipeline.dispose();
});

test('ResilientSystemPipeline: activates Error Boundary fallback when operations fail', async () => {
  let fallbackInvoked = false;

  const pipeline = new ResilientSystemPipeline<string, { status: string; fallbackUsed: boolean }>(
    async () => {
      throw new Error('Fatal service outage');
    },
    {
      maxRetries: 1,
      backoffInitialMs: 5,
      fallback: (payload, error, context) => {
        fallbackInvoked = true;
        assert.ok(context.attempt > 0);
        return { status: `recovered for ${payload}`, fallbackUsed: true };
      },
    }
  );

  const result = await pipeline.process('my-prompt');
  assert.strictEqual(fallbackInvoked, true);
  assert.strictEqual(result.fallbackUsed, true);
  assert.strictEqual(result.status, 'recovered for my-prompt');

  pipeline.dispose();
});

test('ResilientSystemPipeline: fast-fails non-retryable errors without wasting retries', async () => {
  let callCount = 0;

  const pipeline = new ResilientSystemPipeline<string, string>(
    async () => {
      callCount++;
      throw new NonRetryableError('Permanent authorization revoked');
    },
    {
      maxRetries: 3,
      backoffInitialMs: 10,
    }
  );

  await assert.rejects(
    async () => pipeline.process('test'),
    (err: any) => err instanceof NonRetryableError || err.name === 'NonRetryableError'
  );

  // Exactly 1 call, zero wasted retries for NonRetryableError
  assert.strictEqual(callCount, 1);

  pipeline.dispose();
});
