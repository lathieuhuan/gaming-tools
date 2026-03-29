# Simulator

A combat rotation simulator for Genshin Impact. It helps users simulate in-game combat sequences and presents an in-depth analysis of damage output. The simulator operates in two sequential phases:

1. PREP: The user assembles a team up to 4 characters and configure the target.
2. BUILD: The user trigger Events to simulate the combat rotation.

---

## Concepts

(to be updated as the implementation goes)

### Simulator & Simulation

```ts
SimulatorState {
  phase: "PREP" | "BUILD"
  managers: { id, name }[]      // list of simulation managing data to keep their order
  activeId: number              // id of the active simulation
  simulationsById: Record<id, Simulation>
}

Simulation {
  id
  memberOrder                   // list of team member code to keep their order
  members: Record<memberCode, MemberCalc>
  timeline: SimulationEvent[]
  activeMember                  // code of the selected member
  target: TargetCalc            // enemy target
  processor: SimulationProcessor
}
```

### Event System

```
SimulationEvent
├── CharacterEvent  (cate: "C", performer: number)
│   ├── SwitchInEvent      (type: "SI")  — character takes the field
│   ├── ModifyEvent        (type: "M")   — buff/debuff modifier  [TODO]
│   └── HitEvent
│       ├── AbilityHitEvent  (type: "AH") — damage from an ability (talent/constellation) attack
│       └── ReactionHitEvent (type: "RH") — damage from a reaction  [TODO]
└── EnvironmentEvent (cate: "E")          — environment-level event  [TODO]
```

### SimulationProcessor - `logic/SimulationProcessor.ts`

Timeline processing engine - backbone of the Simulator.

#### Main API `processTimeline`

- Whenever called it will reset its state, then process each event in the given timeline. (to be optimized)
- After an event that deals damage (HitEvent...), the hit logs will be updated.
- After a modifying event (ModifyEvent...), one or multiple members or the target will be updated.

Note:

- `members` & `target` are mutable. So only pass deep copies into the constructor function.

---

## System Workflow

(to be updated as the implementation goes)

### PREP

- Create a simulation. Allow users to change members and target only.
- Before transition to BUILD phase, reset calculations on members and target.

### BUILD

Each time users trigger an event:

- The event is added to `timeline`.
- The processor then processes this new timeline.
- Members' attributes and bonuses, target's resistance reduction, or hit logs are updated after every event.

---

## Directory Structure

```
Simulator/
├── Simulator.tsx               — root component, phase switch
├── store.ts                    — Zustand store + selectors
├── types.ts                    — all event and simulation types
├── configs.ts                  — constants
├── utils.ts                    — helper functions
│
├── actions/
│   ├── utils.ts                — helper functions for actions
│   ├── prepare.ts              — PREP-phase actions
│   └── build.ts                — BUILD-phase actions
│
├── logic/
│   ├── SimulationProcessor.ts  — timeline processing engine
│   └── talentCalc.ts           — calculator for character talent
│
├── TopBar/                     — general information of the active simulation and actions towards it
├── Sidebar/                    — simulation list, simulator actions and settings
├── TeamAssembler/              — simulation characters (members) configurations
├── TargetConfiger/             — target configurations [TODO]
├── ActiveMemberView/           — the selected member's live data: attributes, effects...
├── EventLauncher/              — various event menus for users to trigger events
├── TimelineView/               — ordered event history
└── AnalyticsView/              — analysis of damage output
```
