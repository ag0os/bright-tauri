import assert from 'node:assert/strict';
import test from 'node:test';
import { knipFindings, structureFindings } from './check-health-floor.mjs';

const unused = (line) => ({
  issues: [{ file: 'src/example.ts', exports: [{ name: 'unused', line, col: 1 }] }],
});

test('knip identities ignore source locations and preserve finding categories', () => {
  assert.deepEqual(knipFindings(unused(1)), knipFindings(unused(20)));
  assert.notDeepEqual(
    knipFindings(unused(1)),
    knipFindings({
      issues: [{ file: 'src/example.ts', types: [{ name: 'unused' }] }],
    }),
  );
  assert.throws(() => knipFindings({}), /Invalid knip report/);
});

test('knip duplicate groups ignore locations but keep symbol names', () => {
  const group = (line) => ({
    issues: [
      {
        file: 'a.ts',
        duplicates: [
          [
            { name: 'one', line },
            { name: 'two', line: line + 1 },
          ],
        ],
      },
    ],
  });
  assert.deepEqual(knipFindings(group(1)), knipFindings(group(20)));
});

test('structure identities preserve rule and edge, independent of cycle ordering', () => {
  const report = (cycle, to = 'b.ts') => ({
    summary: {
      violations: [
        {
          rule: { name: 'no-cycles' },
          from: 'a.ts',
          to,
          cycle: cycle.map((name) => ({ name })),
        },
      ],
    },
  });
  assert.deepEqual(
    structureFindings(report(['a.ts', 'b.ts'])),
    structureFindings(report(['b.ts', 'a.ts'])),
  );
  assert.notDeepEqual(structureFindings(report([])), structureFindings(report([], 'c.ts')));
  assert.throws(() => structureFindings({}), /Invalid dependency-cruiser report/);
});
