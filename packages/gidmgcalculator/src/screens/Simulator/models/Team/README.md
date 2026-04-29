# Team

The `Team` class is the top-level container for a group of up to 4 members in a simulation. It manages member membership, tracks which member is currently on the field, computes team-wide derived state, and exposes per-member operation handles.

---

## Components

### `TeamState`

- A derived, read-only snapshot of the current team composition. It is recomputed whenever the team roster changes. It aggregates team elements, resonance, enhancement milestones...
- Also provides condition-checking helpers using its data, used internally by `memberCan`.

---

### `Member`

- Represents a character in the team. See `models/Member/README.md` for its full breakdown.
- `Team` stores members in an internal `Map<code, Member>` and provides methods for checking, reading, adding/updating members, and tracking, changing on-field member.

---

### `Team` itself

Beyond roster management, `Team` is responsible for:

- **Initialisation** – initialise the calculation on every member with team-wide bonuses.
- **Member operation factory** – returns the three contextual operation objects (`act`, `can`, `show`) bound to a specific member and the current team.
<!-- - **Utility queries** – e.g. `getMixedCount`, which counts members that differ in element or nation from the performer (used for "mixed team" conditions). -->

A static helper `Team.createMember(code)` bootstraps a bare `Member` from character data and a default weapon.

---

## Member Operation Modules

- These are factory functions that return operation objects scoped to a `(member, team)` pair.
- They are not methods on `Team` but they can be got from `Team` for convenience.

---

### `memberCan` — Condition Guards

**Responsibility:** Decide whether a given effect or bonus _may_ be applied to or by a member, based on the current team and member state. All checks are pure boolean predicates with no side effects.

- `performEffect(condition, inputs?)` – returns if the member is eligible to perform an effect (bonus/penalty)

- `receiveBonus(condition)` – returns if the member is eligible to receive a bonus

---

### `memberAct` — Bonus Application

**Responsibility:** Compute and write bonus values into the member's bonus controllers. It is the write-side counterpart to `memberCan`'s read-side guards.

- `performBonus(spec, tools?)` - runs a `BonusCalc` against the spec and returns the computed `BareBonus`.

- `receiveBonus(meta, bonus, spec, inputs?)` - Takes a computed bonus and routes it to the correct bonus adding method: `addAttrBonus`, `addAttkBonus`. Also resolves dynamic `toStat` paths such as `OWN_ELMT`, `INP_ELMT`, and `P/H/E/C`

---

### `memberShow` — Display Text

**Responsibility:** Produce human-readable strings that describe an ability or buff. It is used purely for UI display and has no effect on simulation state.

- `buffText(spec, inputs?)` - parses an `EffectToParseText` spec through `BonusCalc` and returns a formatted description string for the buff
