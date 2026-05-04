# Simulation Processor

## Overview

`SimulationProcessor` is the top-level orchestrator of a simulation. It owns a `Team` and a `TargetCalc`, and drives them through a sequence of `RawSimulationEvent`s to produce `HitLog`s and `SimulationEvent`s (processed version of RawSimulationEvent). On construction it initialises the team and finalises the target so they are ready for calculation.

## runTimeline - primary entry point

When given a raw timeline, the Processor will first check if its own timeline version (the processed on) is synced with the raw one.

- If it is, the Processor handles the new events.
- If not, the Processor resets all transient state and handles every raw event from scratch.

`runEvent` on the Processor will routes a raw event to the dedicated handler:

- Switch-in (`SI`) – Delegates to `Team` to change the on-field member

- Ability hit (`AH`) – Runs `talentCalc` against the performer and target, produces a `HitLog`

- Ability buff (`AB`) – Calculates and applies bonuses of the buff via `applyMemberBuff` the run `team.finalizeMembers` if success.
- Weapon buff (`WB`) – Calculates and applies bonuses of the buff via `applyMemberBuff` the run `team.finalizeMembers` if success.
- Artifact Set buff (`ASB`) – Calculates and applies bonuses of the buff via `applyMemberBuff` the run `team.finalizeMembers` if success.

- Reaction hit (`RH`) – (not yet implemented)
