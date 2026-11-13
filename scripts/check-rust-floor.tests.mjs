import assert from 'node:assert/strict';
import test from 'node:test';
import { rustFindings } from './check-rust-floor.mjs';

function report(line = 1, summary = 'MissedMutant') {
  return {
    end_time: '2026-11-11T00:00:00Z',
    total_mutants: 1,
    outcomes: [
      { scenario: 'Baseline', summary: 'Success' },
      {
        summary,
        scenario: {
          Mutant: {
            file: 'src/a.rs',
            genre: 'BinaryOperator',
            replacement: '-',
            function: { function_name: 'sum' },
            span: { start: { line, column: 3 }, end: { line, column: 4 } },
          },
        },
      },
    ],
  };
}

test('Rust identity survives line shifts and extracts one-based columns', () => {
  const base = rustFindings(report(), () => 'a + b\n');
  const tip = rustFindings(report(2), () => '// inserted\na + b\n');
  assert.deepEqual(base, tip);
  assert.equal(JSON.parse(base[0])[4], '+');
  assert.deepEqual(
    rustFindings(report(1, 'CaughtMutant'), () => ''),
    [],
  );
});

test('Rust timeouts, failed baselines and incomplete outcomes fail closed', () => {
  assert.throws(() => rustFindings(report(1, 'Timeout'), () => ''), /Inconclusive/);
  const missing = report();
  missing.outcomes.pop();
  assert.throws(() => rustFindings(missing, () => ''), /Incomplete/);
  const failed = report();
  failed.outcomes[0].summary = 'Failure';
  assert.throws(() => rustFindings(failed, () => ''), /baseline failed/);
});
