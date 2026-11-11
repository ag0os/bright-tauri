/**
 * Health identity is category + repository-relative path + symbol for knip, and
 * rule + from + to + cycle members for dependency-cruiser. Locations do not
 * participate, so line shifts do not create findings. Counts retain duplicate
 * findings. Renames can conservatively reintroduce debt. Both trees use the
 * tip's pinned tools and rules, so new rules expose preexisting debt on both.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanup, compare, output, root, save, snapshot } from './check-floor.mjs';

export function knipFindings(report) {
  if (!Array.isArray(report.issues)) throw new Error('Invalid knip report');
  const findings = [];
  const symbol = (entry) => {
    if (Array.isArray(entry)) return entry.map(symbol).sort();
    if (typeof entry?.name !== 'string') throw new Error('Invalid knip symbol');
    return entry.name;
  };
  for (const issue of report.issues) {
    for (const [kind, entries] of Object.entries(issue)) {
      if (kind === 'file' || kind === 'owners') continue;
      if (!Array.isArray(entries)) throw new Error(`Invalid knip category: ${kind}`);
      for (const entry of entries) {
        findings.push(JSON.stringify([kind, issue.file, symbol(entry)]));
      }
    }
  }
  return findings.sort();
}
export function structureFindings(report) {
  if (!Array.isArray(report.summary?.violations))
    throw new Error('Invalid dependency-cruiser report');
  return report.summary.violations
    .map((v) =>
      JSON.stringify([
        v.rule.name,
        v.from,
        v.to,
        v.cycle?.map((edge) => (typeof edge === 'string' ? edge : edge.name)).sort() ?? [],
      ]),
    )
    .sort();
}
function analyze(command, args, directory, allowed) {
  const result = spawnSync(path.join(root, 'node_modules/.bin', command), args, {
    cwd: directory,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || !allowed.includes(result.status)) {
    throw new Error(
      `${command} failed (${result.status}): ${result.error ?? ''}\n${result.stderr}\n${result.stdout}`,
    );
  }
  if (result.stderr) console.error(result.stderr);
  return JSON.parse(result.stdout);
}
function healthFloor(state) {
  const results = { knip: [], structure: [] };
  for (const [label, directory] of [
    ['base', state.directory],
    ['tip', root],
  ]) {
    const start = performance.now();
    const knip = analyze(
      'knip',
      ['--config', path.join(root, 'knip.json'), '--reporter', 'json', '--no-config-hints'],
      directory,
      [0, 1],
    );
    save(`knip-${label}.json`, knip);
    results.knip.push(knipFindings(knip));
    console.log(`knip ${label}: ${((performance.now() - start) / 1000).toFixed(2)}s`);
    const structureStart = performance.now();
    const structure = analyze(
      'depcruise',
      ['src', '--config', path.join(root, '.dependency-cruiser.cjs'), '--output-type', 'json'],
      directory,
      [0, 1],
    );
    save(`structure-${label}.json`, structure);
    results.structure.push(structureFindings(structure));
    console.log(
      `dependency-cruiser ${label}: ${((performance.now() - structureStart) / 1000).toFixed(2)}s`,
    );
  }
  const errors = [];
  for (const [label, [base, tip]] of Object.entries(results)) {
    try {
      compare(base, tip, label);
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Health reports: ${output}`);
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  let state;
  try {
    state = snapshot();
    healthFloor(state);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (state) cleanup(state.directory);
  }
}
