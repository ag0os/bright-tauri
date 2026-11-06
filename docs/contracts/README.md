# Contracts

A Contract records a component's obligations in one file,
`docs/contracts/<component>.md`. A component without a file has no Contract;
claim no coverage for it. Changes to behavior update the Contract in the same PR.
This README is guidance, not a component Contract.

Use this shape:

```markdown
---
component: component-name
covers:
  - src/path/to/component/
depends_on: []
tests:
  - src/test/contract/component.test.ts
---

# Component name

Coverage: unknown

## Obligations

### COMPONENT-001 Observable obligation

Reason: Why the obligation matters.
Kind: functional
Proof: Test named COMPONENT-001, or a link to recorded PR evidence.

## Decisions

- [Relevant decision](../decisions/decision-file.md)
```

`covers` lists component paths, `depends_on` lists component dependencies, and
`tests` lists proof test paths. Frontend Contract tests live in
`src/test/contract/`; backend Contract tests live in `src-tauri/tests/contract/`.
List only actual paths and decisions in a real Contract. No test directories are
needed until the first feature supplies a Contract and its proof.

Coverage is `covered` or `unknown`, backed by evidence and never invented. Each
obligation has an id and statement in its heading, a reason, a kind (`functional`
or `non-functional`), and proof naming its test by id or linking recorded PR
evidence. Point to decisions and their derivations in `docs/decisions/`; do not
repeat them.

Membership test: if reimplementing the component in another language would
invalidate the assertion, it is an implementation test, not Contract.
