# Simulator Implementation Plan

## Phase 1: Core Features

- [ ] **Target Configuration** — Implement target configuration in `TargetConfiger/`. This is foundational as damage calculations depend on target parameters.

- [ ] **Team Bonus Buff** — Implement team bonus buff in [TeamBuffList](./EventLauncher/BuffEventMenu/TeamBuffList.tsx). See [BuffTeamBonus](../Calculator/Modifiers/BuffTeamBonus/BuffTeamBonus.tsx) for reference.

- [ ] **Attack Alter** — Implement attack alter in [AbilityEventItem](./EventLauncher/AbilityEventMenu/AbilityEventItem.tsx). See [BuffElement](../Calculator/Modifiers/BuffElement/BuffElement.tsx) for reference.

## Phase 2: Buff/Debuff System

- [ ] **Debuffs** — Implement debuffs: Ability debuffs, artifact set debuffs, weapon debuffs.

- [ ] **Custom Buffs & Debuffs** — Allow users to create custom buffs and debuffs.

## Phase 3: Timeline Manipulation

- [ ] **Event Cancellation** — Allow users to cancel/remove events from the timeline.

- [ ] **Event Insert** — Allow users to insert events at specific positions in the timeline (not just append).

- [ ] **Timeline Navigation** — Implement jump back to a past event on the timeline to view member stats, effects, and hit logs after that event.

## Phase 4: Advanced Event Types

- [ ] **Auxiliary Events** — Implement auxiliary events which are auto-triggered after some events (e.g., passive procs, constellation effects).

- [ ] **ReactionHitEvent** — Implement reaction damage events (type: "RH") for transformative/amplifying reactions.

- [ ] **EnvironmentEvent** — Implement environment-level events (cate: "E") for non-member effects.
