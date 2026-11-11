import assert from 'node:assert/strict';
import test from 'node:test';
import { badMutants, compare } from './check-floor.mjs';

function report(source, line, status = 'Survived') {
  return {
    files: {
      'src/example.ts': {
        source,
        mutants: [
          {
            status,
            mutatorName: 'BooleanLiteral',
            replacement: 'false',
            location: { start: { line, column: 8 }, end: { line, column: 12 } },
          },
        ],
      },
    },
  };
}

test('mutant identity survives inserted lines and groups uncovered with survivors', () => {
  const base = badMutants(report('return true;\n', 1));
  const tip = badMutants(report('// inserted\nreturn true;\n', 2, 'NoCoverage'));
  assert.deepEqual(tip, base);
  assert.equal(JSON.parse(base[0])[2], 'true');
  assert.deepEqual(badMutants(report('return true;\n', 1, 'Killed')), []);
});

test('floor counts duplicate findings and rejects an additional occurrence', () => {
  assert.doesNotThrow(() => compare(['old', 'old'], ['old'], 'test-floor'));
  assert.throws(() => compare(['old'], ['old', 'old'], 'test-floor'), /1 new findings/);
  assert.throws(() => compare([], ['new'], 'test-floor'), /new findings/);
});

test('runtime errors stay visible and cannot mask a newly surviving mutant', () => {
  const failed = badMutants(report('return true;\n', 1, 'RuntimeError'));
  const survived = badMutants(report('return true;\n', 1));
  assert.equal(failed.length, 1);
  assert.notDeepEqual(failed, survived);
});
