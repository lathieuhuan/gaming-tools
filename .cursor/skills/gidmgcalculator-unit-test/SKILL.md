---
name: gidmgcalculator-unit-test
description: Used to write and edit unit tests (using Vitest) for the gidmgcalculator package. Covers test setup, mocks, utils placement: global-level under src/__tests__; module-level & feature-level under src/**/__tests__ of each folder.
---

# gidmgcalculator Vitest tests

## Package and commands

- Scope: `packages/gidmgcalculator` only (Vitest is wired in its `vite.config.ts`).
- Run from that directory: `npm run unit-test` (runs `vitest`).

## Where tests must live

Vitest `include` is `./src/**/__tests__/**/*.test.ts` (see `vite.config.ts`). New unit tests must match that path and naming.

## Config to read first

- `packages/gidmgcalculator/vite.config.ts` — `test.setupFiles`, `test.include`, `@` alias to `src/`.
- `packages/gidmgcalculator/src/tests/setup.ts` — runs before tests; populates `$AppCharacter` and `$AppWeapon` from shared mocks. Many tests assume this data is already loaded.

## Imports and APIs

- Import `describe`, `test` (or `it`), `expect`, and `vi` from `vitest`.
- Use the `@/` path alias for source imports (same as app code).

## Shared mocks (static fixture data)

Directory: `packages/gidmgcalculator/src/__tests__/mocks/`

- `characters.mock.ts` — `CHARACTER_MOCKS`, `CharacterMock` (numeric codes used with `$AppCharacter.get` and builders).
- `weapons.mock.ts` — `WEAPON_MOCKS` and related exports.

Prefer importing these constants and codes instead of inventing parallel fixture objects.

## Shared test utilities (builders / factories)

Directory: `packages/gidmgcalculator/src/__tests__/utils/`

- `__characterMockup.ts`, `__weaponMockup.ts` — used by mocks and available when tests need tailored entities.

- Shared utility functions that are exported must have `__` prefix to their names.

Use these when a test needs a specific shape beyond what a single mock row provides.

## Test folder structure

- A test folder is named `__tests__`. Inside it, test file names must match the tested file names — e.g. abc.test.ts for anc.ts

- A test folder may contain `mocks` folder for fixture data, `utils` folder for helper functions, `constants` file for config constants. Prefer extending or importing these before duplicating setup in individual test files.

## Writing tests

1. If the code under test depends on app characters, weapons, or artifacts, rely on `setup.ts` population or construct data via mocks/utils above.
2. One `describe` per unit (class/module); nested `describe` for method or behavior groups; `test` names state expected behavior.
3. Use `vi.mocked(...)`, `vi.spyOn`, or `vi.fn` only when isolating modules or observing calls; avoid mocking what `setup.ts` already satisfies unless the test truly needs a different boundary.
