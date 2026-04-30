# Simulation Processor

## Overview

`SimulationProcessor` is the top-level orchestrator of a simulation. It owns a `Team` and a `TargetCalc`, and drives them through a sequence of `SimulationEvent`s. On construction it initialises the team and finalises the target so they are ready for calculation.

The primary entry point is `runTimeline`. When running a timeline from scratch, it resets all transient state then process each event in the given timeline. This API routes each event to a dedicated handler:

- Switch-in (`SI`) – Delegates to `Team` to change the on-field member

- Ability hit (`AH`) – Runs `talentCalc` against the performer and target, produces a `HitLog`

- Ability buff (`AB`) – Validates the buff via `memberCan`, then uses `bonusOperations` to resolve, perform, and deliver bonuses to all affected members, finally run `finalizeAttrs` on each affected members

- Reaction hit (`RH`) – (not yet implemented)

- Weapon buff (`WB`) – (not yet implemented)

After the timeline is replayed, `SimulationProcessor` exposes the accumulated `hitLogs`.

---

## `bonusOperations`

### Responsibility

A factory function that returns a set of helpers for orchestrating the full lifecycle of a bonus event — from filtering which specs are applicable, to performing the calculation, to delivering the result to every affected member.

It is stateless per call but accumulates an `allRecipients` set as bonuses are delivered, so callers can batch-finalise attributes after all bonuses have been applied.

### API

```ts
bonusOperations(performer, team, inputs?, refi?)
```

Provides:

- `resolveBonusSpecs(specs)` – Filters a list of `BonusSpec`s to only those the performer is eligible to trigger, then returns them sorted by applied target module type (talent-level → attribute → attack)

- `getAffectedMembers(affect)` – Resolves a `ModAffectType` to the concrete list of `Member` who should receive the bonus

- `performAndDeliverBonuses(meta, specs, parentAffect?)` – Iterates the resolved specs, produces bonus via performer action (`memberAct`) for each spec, resolves recipients, and delegates to `deliverBonus`

- `deliverBonus(meta, bonus, spec, recipients)` – For each recipient, checks if they can receive bonus (`memberCan`) and, if eligible, let they receive the bonus (`memberAct`)

- `allRecipients` – A `Set<Member>` of every member that received at least one bonus
