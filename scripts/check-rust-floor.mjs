/**
 * Rust floor identity: path, function name, mutation genre, replacement, exact
 * original source span, and trimmed containing lines. Like the TS gate, line
 * shifts are stable; context edits can flag old debt, and identical duplicate
 * expressions can swap outcomes. Counts retain duplicate missed mutants.
 * Cargo-mutants 27.1.0 uses one-based columns. Timeouts are inconclusive and fail
 * closed, as do incomplete reports, failed baselines and removed subjects.
 * Runs are serial and share a target cache, not mutated source or test results.
 */
import { spawnSync } from 'node:child_process';
import { globSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanup, compare, output, root, run, save, snapshot } from './check-floor.mjs';

export function rustFindings(report, source) {
  if (!Array.isArray(report.outcomes) || !report.end_time)
    throw new Error('Incomplete cargo-mutants report');
  const mutants = report.outcomes.filter((entry) => entry.scenario?.Mutant);
  if (mutants.length !== report.total_mutants) throw new Error('Incomplete cargo-mutants outcomes');
  const baseline = report.outcomes.find((entry) => entry.scenario === 'Baseline');
  if (baseline?.summary !== 'Success') throw new Error('cargo-mutants baseline failed');
  const findings = [];
  for (const entry of mutants) {
    if (!['CaughtMutant', 'MissedMutant', 'Unviable'].includes(entry.summary)) {
      throw new Error(`Inconclusive Rust outcome: ${entry.summary}`);
    }
    if (entry.summary !== 'MissedMutant') continue;
    const m = entry.scenario.Mutant;
    const text = source(m.file);
    const lines = text.split('\n');
    const offset = ({ line, column }) =>
      lines.slice(0, line - 1).reduce((n, s) => n + s.length + 1, 0) + column - 1;
    findings.push(
      JSON.stringify([
        m.file,
        m.function?.function_name,
        m.genre,
        m.replacement,
        text.slice(offset(m.span.start), offset(m.span.end)),
        lines
          .slice(m.span.start.line - 1, m.span.end.line)
          .join('\n')
          .trim(),
      ]),
    );
  }
  return findings;
}
function rustRun(directory, subjects, label) {
  if (!subjects.length) return [];
  for (const file of subjects) readFileSync(path.join(directory, 'src-tauri', file), 'utf8');
  const destination = path.join(output, `rust-${label}`);
  rmSync(destination, { recursive: true, force: true });
  const start = performance.now();
  const result = spawnSync(
    'cargo',
    [
      '+1.99.0',
      'mutants',
      '--copy-target=false',
      '--jobs',
      '1',
      '--timeout',
      '60',
      '--build-timeout',
      '300',
      '--cargo-arg=--locked',
      '--output',
      destination,
      ...subjects.flatMap((file) => ['--file', file]),
    ],
    {
      cwd: path.join(directory, 'src-tauri'),
      stdio: 'inherit',
      env: { ...process.env, CARGO_TARGET_DIR: path.join(root, 'src-tauri/target') },
    },
  );
  console.log(`Rust mutation ${label}: ${((performance.now() - start) / 1000).toFixed(2)}s`);
  if (result.error || ![0, 2].includes(result.status)) {
    throw new Error(`cargo-mutants execution failed (${result.status}): ${result.error ?? ''}`);
  }
  const listed = JSON.parse(
    readFileSync(path.join(destination, 'mutants.out/mutants.json'), 'utf8'),
  );
  if (!Array.isArray(listed)) throw new Error('Invalid cargo-mutants subject report');
  // cargo-mutants emits no outcomes.json when a valid subject has no mutants.
  if (listed.length === 0 && result.status === 0) {
    save(`rust-${label}-summary.json`, { total: 0, caught: 0, missed: 0, timeout: 0, unviable: 0 });
    return [];
  }
  const report = JSON.parse(
    readFileSync(path.join(destination, 'mutants.out/outcomes.json'), 'utf8'),
  );
  if (listed.length !== report.total_mutants) throw new Error('Missing Rust mutants');
  save(`rust-${label}-summary.json`, {
    total: report.total_mutants,
    caught: report.caught,
    missed: report.missed,
    timeout: report.timeout,
    unviable: report.unviable,
  });
  return rustFindings(report, (file) =>
    readFileSync(path.join(directory, 'src-tauri', file), 'utf8'),
  );
}
function rustFloor(state) {
  const all = (directory) =>
    [...globSync('src/**/*.rs', { cwd: path.join(directory, 'src-tauri') })].sort();
  const full = state.changed.some((file) =>
    /^src-tauri\/(tests\/|\.cargo\/|Cargo\.(toml|lock)$|build\.rs$)/.test(file),
  );
  const changed = new Set(
    state.changed.filter((file) => file.startsWith('src-tauri/')).map((file) => file.slice(10)),
  );
  const base = all(state.directory).filter((file) => full || changed.has(file));
  const tip = all(root).filter((file) => full || changed.has(file));
  save('rust-subjects.json', { baseCommit: state.base, full, base, tip });
  console.log(
    `Rust subjects base: ${JSON.stringify(base)}\nRust subjects tip: ${JSON.stringify(tip)}`,
  );
  const missing = base.filter((file) => !tip.includes(file));
  if (missing.length)
    throw new Error(`Removed or renamed Rust subjects require review: ${missing.join(', ')}`);
  if (!base.length && !tip.length) return;
  if (!run('cargo', ['mutants', '--version']).includes('27.1.0'))
    throw new Error('Install cargo-mutants 27.1.0');
  compare(rustRun(state.directory, base, 'base'), rustRun(root, tip, 'tip'), 'rust-mutation');
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  let state;
  try {
    state = snapshot();
    rustFloor(state);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (state) cleanup(state.directory);
  }
}
