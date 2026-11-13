/**
 * Mutation floor identity: path + mutator + exact original span + replacement +
 * the source line(s) containing the span, with outer whitespace trimmed. Compare
 * occurrence counts of bad outcomes (Survived and NoCoverage together, runtime
 * errors separately), not IDs
 * or line numbers. Inserting lines above a mutant does not change its identity.
 * Editing its context can conservatively report old debt as new. Identical
 * duplicate expressions on identical lines are indistinguishable: one repaired
 * duplicate can mask one newly surviving duplicate. Counts limit, not eliminate,
 * that false negative. Renames/removals of selected subjects fail closed.
 * Reports and subject manifests are retained under reports/checks for inspection.
 */
import { spawnSync } from 'node:child_process';
import {
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const root = process.cwd();
export const output = path.join(root, 'reports/checks');
export function run(command, args, cwd = root, capture = true) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed (${result.status}): ${result.error ?? result.stdout ?? ''}`,
    );
  }
  return result.stdout?.trim() ?? '';
}
export function save(name, value) {
  mkdirSync(output, { recursive: true });
  writeFileSync(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`);
}
export function compare(base, tip, label) {
  const counts = new Map();
  for (const key of base) counts.set(key, (counts.get(key) ?? 0) + 1);
  const added = [];
  for (const key of tip) {
    if (counts.get(key)) counts.set(key, counts.get(key) - 1);
    else added.push(key);
  }
  save(`${label}-new.json`, added);
  if (added.length) throw new Error(`${label}: ${added.length} new findings\n${added.join('\n')}`);
  console.log(`${label}: no new findings (${base.length} base, ${tip.length} tip).`);
}
export function snapshot() {
  const ref = process.env.BASE || 'origin/main';
  const base = run('git', ['merge-base', ref, 'HEAD']);
  console.log(`Floor base: ${base} (merge-base with ${ref})`);
  const directory = mkdtempSync(path.join(tmpdir(), 'bright-checks-'));
  try {
    run('git', ['worktree', 'add', '--detach', directory, base]);
    symlinkSync(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'dir');
    const changed = run('git', ['diff', '--name-only', '--no-renames', base, '--']);
    const untracked = run('git', ['ls-files', '--others', '--exclude-standard']);
    return {
      directory,
      base,
      changed: [...new Set(`${changed}\n${untracked}`.split('\n').filter(Boolean))],
    };
  } catch (error) {
    cleanup(directory);
    throw error;
  }
}
export function cleanup(directory) {
  run('git', ['worktree', 'remove', '--force', directory]);
}
async function subjects(directory) {
  const config = (await import(pathToFileURL(path.join(directory, 'stryker.config.mjs')).href))
    .default;
  const positive = config.mutate.filter((pattern) => !pattern.startsWith('!'));
  const exclude = config.mutate.filter((pattern) => pattern.startsWith('!')).map((p) => p.slice(1));
  return [...globSync(positive, { cwd: directory, exclude })].sort();
}
export function badMutants(report) {
  const result = [];
  for (const [file, entry] of Object.entries(report.files)) {
    const lines = entry.source.split('\n');
    const offset = ({ line, column }) =>
      lines.slice(0, line - 1).reduce((n, s) => n + s.length + 1, 0) + column - 1;
    for (const mutant of entry.mutants) {
      if (!['Survived', 'NoCoverage', 'RuntimeError'].includes(mutant.status)) continue;
      const { start, end } = mutant.location;
      result.push(
        JSON.stringify([
          file,
          mutant.mutatorName,
          entry.source.slice(offset(start), offset(end)),
          mutant.replacement,
          lines
            .slice(start.line - 1, end.line)
            .join('\n')
            .trim(),
          mutant.status === 'RuntimeError' ? 'RuntimeError' : 'Uncaught',
        ]),
      );
    }
  }
  return result;
}
async function mutationRun(directory, selected, label) {
  if (!selected.length) return [];
  const configFile = path.join(directory, '.check-stryker.config.mjs');
  const report = path.join(output, `mutation-${label}.json`);
  rmSync(report, { force: true });
  writeFileSync(
    configFile,
    `import config from './stryker.config.mjs';\nexport default { ...config, mutate: ${JSON.stringify(selected)}, incremental: false, reporters: ['clear-text', 'json'], jsonReporter: { fileName: ${JSON.stringify(report)} }, thresholds: { break: 0 } };\n`,
  );
  try {
    const start = performance.now();
    run(path.join(root, 'node_modules/.bin/stryker'), ['run', configFile], directory, false);
    console.log(`Mutation ${label}: ${((performance.now() - start) / 1000).toFixed(2)}s`);
    const data = JSON.parse(readFileSync(report, 'utf8'));
    // Stryker omits files with zero generated mutants (for example barrels).
    // Selection manifests and source existence, not report entries, prove subjects.
    for (const file of selected) readFileSync(path.join(directory, file), 'utf8');
    const pending = Object.values(data.files)
      .flatMap((entry) => entry.mutants)
      .filter(
        (m) =>
          ![
            'Killed',
            'Survived',
            'NoCoverage',
            'Timeout',
            'CompileError',
            'Ignored',
            'RuntimeError',
          ].includes(m.status),
      );
    if (pending.length) throw new Error('Incomplete mutation results');
    return badMutants(data);
  } finally {
    rmSync(configFile, { force: true });
  }
}
async function mutationFloor(state) {
  const allBase = await subjects(state.directory);
  const allTip = await subjects(root);
  const full = state.changed.some((file) =>
    /^(src\/test\/|src\/test-utils\/|vitest\.config\.|stryker\.config\.|scripts\/.*(floor|mutation)|package(-lock)?\.json)/.test(
      file,
    ),
  );
  const selected = new Set(full ? [...allBase, ...allTip] : state.changed);
  const base = allBase.filter((file) => selected.has(file));
  const tip = allTip.filter((file) => selected.has(file));
  save('mutation-subjects.json', { baseCommit: state.base, full, base, tip });
  console.log(
    `Mutation subjects base (${base.length}):\n${base.join('\n')}\nMutation subjects tip (${tip.length}):\n${tip.join('\n')}`,
  );
  const missing = base.filter((file) => !tip.includes(file));
  if (missing.length)
    throw new Error(`Removed or renamed mutation subjects require review: ${missing.join(', ')}`);
  compare(
    await mutationRun(state.directory, base, 'base'),
    await mutationRun(root, tip, 'tip'),
    'mutation',
  );
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  let state;
  try {
    state = snapshot();
    await mutationFloor(state);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (state) cleanup(state.directory);
  }
}
