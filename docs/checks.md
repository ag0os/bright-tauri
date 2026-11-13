# Merge-base checks

`npm run ci` runs the mutation floor before the existing type, lint, test, Rust,
and generated binding checks. `BASE` selects the reference for `git merge-base`
(default `origin/main`). Fetch that reference and enough history first. Local
checks include tracked working edits and untracked files, not only HEAD.

`npm run check:mutation` selects changed files under the Stryker configuration's
mutate globs. Shared test infrastructure, Vitest or Stryker configuration,
package manifests, and floor scripts expand selection to every subject. Base
and tip subjects are written to `reports/checks/mutation-subjects.json` and
printed before execution. Removed or renamed subjects fail closed and require
an explicit review rather than silently losing their old obligations.

Both runs are fresh, without incremental reuse. Survived and NoCoverage mutants
share a bad-outcome category. Runtime errors are compared in a separate category,
so existing runner failures do not masquerade as killed mutants or hide new survivors. Identity uses path, mutator, original source span,
replacement, and trimmed containing lines, with occurrence counts for duplicates.
Line shifts do not matter. Context edits can flag old debt as new; identical
expressions on identical lines can swap outcomes without detection. See the
script header for this deliberately conservative rule's limits. Reports retain
all evidence; there is no editable survivor baseline.

`npm run mutation` remains a full local run. The weekly workflow runs the full
main tree and uploads its JSON/HTML reports and `survivors.json` for 90 days.
Scheduled reporting carries broad debt visibility, not permission to skip
subjects when the per-change floor expands. A full shared-infrastructure gate
may exceed ten minutes; do not reduce its subjects to hide that cost.

Run CI and mutation serially: Vitest can otherwise discover tests in Stryker's
sandbox. Temporary base worktrees are removed on normal success or failure.
After an interrupted process, inspect `git worktree list` and remove only the
abandoned bright-checks worktree. No development server needs to be restarted.

The workflow retains per-change subject manifests and comparison reports for 30
days, including failed gates. Gate execution errors, incomplete reports, and
missing subjects fail the check rather than becoming an empty baseline.

## TypeScript health

`npm run check:health` compares knip and dependency-cruiser JSON reports on both
trees using the tip's pinned tool versions and configuration. Raw reports and
new findings remain under `reports/checks`. `health:knip` and `health:structure`
print full local reports, including existing debt.

Knip covers unused files, exports, types and dependencies. Generated bindings
are excluded because Rust owns their exports. Storybook supplies its runtime entry points through the built-in knip plugin;
required story exports are not treated as unused. Tests are explicit entry
points, with entry exports checked. Finding identity is category, file and
symbol, ignoring source locations; duplicate groups use sorted symbol names.
An identical finding can mask another identical finding, and renames can flag
old debt as new. Framework-owned exports are handled by their plugins.

The starter structure rules prohibit cycles, imports from shared or the design
system into features, imports between feature modules, and generated types
importing application code. Tests and stories are excluded from the production
structure graph. Existing navigation-to-feature imports are compared as debt.
Identity is rule, source, target and sorted cycle members. Both trees use the
same rules; tightening a rule reports new architecture debt relative to that
rule's analysis of the base, rather than rejecting historical dependencies.

## Rust mutation

Install `cargo install cargo-mutants --version 27.1.0 --locked` and Rust 1.99.0.
`npm run mutation:rust` remains a full local report. `check:rust-mutation` selects
changed Rust source files; changes to Cargo manifests, build setup, `.cargo`,
or external tests select all Rust files. Removed or renamed files fail closed.
There is no in-place mutation. Serial scratch runs share a build target cache
at `src-tauri/target`, including across base and tip; they do not reuse test
outcomes. Avoid concurrent Cargo or gate runs against that target.

Identity uses path, function, genre, replacement, exact original span and
trimmed containing lines. Its context and duplicate limits match the TS floor.
Only newly missed mutants fail the floor; compile failures are unviable mutants.
Timeouts, baseline failures and incomplete results fail the execution itself.
Cargo uses locked dependency resolution and may fetch missing crates. Set
`CARGO_NET_OFFLINE=true` when measuring with an already populated registry cache.
CI pins the toolchain and tool; reports and subject lists are uploaded with the
other gate evidence. Timing on macOS is evidence about this machine, not a
measurement of the Linux CI runner. The workflow allows long full-subject runs
without silently narrowing them.

Measured locally with Rust 1.99.0 and cargo-mutants 27.1.0: the full four-worker
run tested 189 mutants in 447.02 seconds (64 caught, 54 missed, 71 unviable,
zero timeouts). The serial cached floor on
`src/repositories/story_version.rs` tested 13 mutants on each side in 112.38
seconds total, including setup (65.52 seconds base, 46.52 seconds tip). Each
side caught nine mutants and found four unviable ones. The full run overlapped
TypeScript mutation work; these numbers do not establish Linux CI runtime or
a worst-case full-infrastructure budget.

Zero-mutant files remain in the subject manifests. Stryker omits their file
entries in reports; cargo-mutants emits an empty mutant list without an outcome
report. These documented zero cases are accepted only after successful tool
execution and source existence checks. Vitest collects coverage from every test
to include application subjects that have no test importers.

Base worktrees reuse the installed tip node_modules to keep analysis tool versions
consistent. They do not reconstruct historical npm dependency installations.
Dependency-induced changes shared by both trees can therefore be masked; compare
package upgrades with this limitation in mind.
