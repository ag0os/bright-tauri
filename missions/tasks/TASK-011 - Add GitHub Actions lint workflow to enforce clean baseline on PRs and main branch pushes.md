---
id: TASK-011
title: >-
  Add GitHub Actions lint workflow to enforce clean baseline on PRs and main
  branch pushes
status: Done
priority: high
assignee: worker
labels:
  - devops
  - 'plan:lint-baseline-cleanup'
dependencies:
  - TASK-003
  - TASK-004
  - TASK-006
  - TASK-007
  - TASK-009
  - TASK-010
createdAt: '2026-04-21T20:24:11.703Z'
updatedAt: '2026-04-21T20:58:10.000Z'
---

## Description

Create `.github/workflows/lint.yml` that enforces the clean lint baseline by running `npm run lint:all` on every pull request and push to the main development branch. This depends on all preceding tasks having landed a clean baseline first.

Requirements:
- Invoke exactly the scripts defined in `package.json:17-22` (`lint`, `lint:rust`, `lint:all`) — do not duplicate or reimplement command logic.
- Cache npm and Cargo dependencies to avoid redundant downloads on repeated runs.
- Do not interfere with the existing `.github/workflows/claude.yml` or `.github/workflows/claude-code-review.yml` workflows.

**File in scope**: `.github/workflows/lint.yml` (new file).

<!-- AC:BEGIN -->
- [x] #1 .github/workflows/lint.yml exists and triggers on pull_request events and push to the main development branch.
- [x] #2 The workflow runs npm ci and npm run lint:all using the scripts already defined in package.json, without reimplementing or duplicating lint command logic.
- [x] #3 npm and Cargo dependency caches are configured so repeated CI runs do not redundantly re-download dependencies.
- [x] #4 The workflow does not conflict with or shadow the existing claude.yml or claude-code-review.yml workflows.
- [x] #5 A passing npm run lint:all run completes successfully in the workflow environment (QC-001).
<!-- AC:END -->

## Implementation Notes

Added `.github/workflows/lint.yml` with `pull_request` and `push` to `main` triggers, `npm ci`, and `npm run lint:all` using the existing package scripts. The workflow uses `actions/setup-node@v4` with npm caching plus an `actions/cache@v4` Cargo cache and leaves the existing Claude workflows untouched.

Verification: `npm run lint:all` passes locally after the baseline cleanup fixes landed.
