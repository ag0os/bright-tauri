import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('node', [
  '--test',
  'scripts/check-floor.tests.mjs',
  'scripts/check-health-floor.tests.mjs',
  'scripts/check-rust-floor.tests.mjs',
]);
run('npm', ['run', 'check:health']);
run('npm', ['run', 'check:rust-mutation']);
run('npm', ['run', 'check:mutation']);
run('tsc', ['--noEmit']);
run('npm', ['run', 'lint:all']);
run('npm', ['run', 'test:run']);
run('cargo', ['test'], fileURLToPath(new URL('../src-tauri/', import.meta.url)));

// cargo test regenerates these files via ts-rs, including previously untracked types.
const drift = spawnSync('git', ['status', '--porcelain', '--', 'src/types'], {
  cwd: root,
  encoding: 'utf8',
});
if (drift.error) console.error(drift.error.message);
if (drift.status !== 0) process.exit(drift.status ?? 1);
if (drift.stdout.trim()) {
  run('git', ['status', '--short', '--', 'src/types']);
  run('git', ['diff', '--', 'src/types']);
  console.error("src/types is stale: run 'cd src-tauri && cargo test --lib' and commit the result");
  process.exit(1);
}
console.log('All checks passed, including generated TS type drift.');
