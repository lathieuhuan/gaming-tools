# Simulator

A combat rotation simulator for game Genshin Impact. It enables users to model complex combat sequences and provides exhaustive analytics on damage output. The simulation workflow is divided into two distinct phases:

1. **PREP**: Assemble a team of up to four characters and configure target parameters.
2. **BUILD**: Trigger Events to execute the combat rotation and receive instant analytics.

---

## Concepts

- **Member**: Characters who join the Simulation. See [Member](.\models\Member\README.md)
- **Team**: Manages the collection of Members inside SimulationProcessor. See [Team](.\models\Team\README.md)
- **SimulationProcessor**: Timeline processing engine - backbone of the Simulation. It's main production is `HitLog[]`. See [SimulationProcessor](.\models\SimulationProcessor\README.md)

### Simulation

```ts
Simulation {
  id: number
  memberOrder: number[]          // ordered member codes
  members: Map<number, Member>
  activeMember: number           // selected member code
  inputs: SimulationInputs       // per-member modifier control inputs
  timeline: SimulationEvent[]
  target: TargetCalc
  processor: SimulationProcessor
}
```

### SimulationEvent - Event System

```txt
SimulationEvent
├── MemberEvent  (cate: "M", performer: number)
│   ├── SwitchInEvent      (type: "SI")  — character takes the field
│   ├── ModifyEvent        (type: "M")   — buff/debuff modifier  [TODO]
│   └── HitEvent
│       ├── AbilityHitEvent  (type: "AH") — damage from an ability (talent/constellation) attack
│       └── ReactionHitEvent (type: "RH") — damage from a reaction  [TODO]
└── EnvironmentEvent (cate: "E")          — environment-level event  [TODO]
```

---

## General Workflow

(to be updated as the implementation goes)

### PREP

- Create a simulation. Allow users to change members (`Simulation['members']`) and target only.

### BUILD

- Each time users trigger an event:
  1. The event is added to `timeline`.
  2. The processor then processes this new timeline.
  3. Members' attributes and bonuses, target's resistance reduction, or hit logs are updated after every event.
- If the user returns to PREP phase, we will throw away the build process after asking for confirmation.
- We don't update Members outside of the SimulationProcessor. After PREP phase, they are kept as prototypes for restarting or resetting.

---

## Directory Structure

```txt
Simulator/
├── index.ts                    — default module export
├── store.ts                    — Zustand store with immer + selectors
├── types.ts                    — all event and simulation types
├── configs.ts                  — constants
├── utils.ts                    — helper functions
├── mock/                       — sample data / dev helpers
│
├── actions/
│   ├── utils.ts                — helper functions for actions
│   ├── prepare.ts              — PREP-phase actions
│   └── build.ts                — BUILD-phase actions
│
├── logic/
│   ├── talentCalc.ts          — talent / attack-item calculator wiring
│   └── makeAttackItemCalc.ts  — attack item calc factory
│
├── models/
│   ├── Member/
│   ├── Team/
│   └── SimulationProcessor.ts
│
├── components/                 — small shared UI (e.g. SidebarButton)
├── Simulator.tsx               — root component, phase switch
├── TopBar/                     — general information of the active simulation and actions towards it
├── Sidebar/                    — simulation list, simulator actions and settings
├── TeamAssembler/              — simulation characters (members) configurations
├── TargetConfiger/             — target configurations [TODO]
├── ActiveMemberView/           — the selected member's live data: attributes, effects...
├── EventLauncher/              — various event menus for users to trigger events
├── TimelineView/               — ordered event history
└── AnalyticsView/              — analysis of damage output
```

