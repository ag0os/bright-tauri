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
