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
  members: Record<memberCode, CharacterCalc>
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
│       ├── TalentHitEvent  (type: "TH") — damage from a talent attack
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

- `members` & `target` are mutable. So only pass copies into the constructor function.

---

## System Workflow

(to be updated as the implementation goes)

### PREP

- Create a simulation. Allow users to change members and target only.

### BUILD

Each time users trigger an event:

- The event is added to `timeline`.
- The processor then processes this new timeline and produces new hit logs.

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
│   ├── build.ts                — BUILD-phase actions
│   └── dev.ts                  — actions with hardcoded data for development
│
├── logic/
│   ├── SimulationProcessor.ts  — timeline processing engine
│   └── talentCalc.ts           — calculator for character talent
│
├── SimulationPrepper/          — PREP-phase UI
│
├── IntroTopBar/                — BUILD phase's top bar
├── ActiveMemberView/           — BUILD-phase, the selected member's live data: attributes, effects...
├── EventMenu/                  — BUILD-phase, various event menus for users to trigger events
├── TimelineView/               — BUILD-phase, ordered event history
└── AnalyticsView/              — BUILD-phase, analysis of damage output
```
