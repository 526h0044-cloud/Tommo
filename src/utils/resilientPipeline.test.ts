import { test } from 'node:test';
import assert from 'node:assert';
import {
  ResilientSystemPipeline,
  CircuitBreakerOpenError,
  PipelineTimeoutError,
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
  let stateChanges: string[] = [];
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
