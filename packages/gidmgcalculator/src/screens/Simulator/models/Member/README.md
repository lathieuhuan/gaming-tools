# Member

`Member` represents a single character participating in a simulation. It holds all the data and controls needed to calculate that character's attributes, bonuses, and some base damage at any point during a simulation run.

---

## Components

### `MemberState`

- Holds the mutable character state: level, talent levels (NAs, ES, EB), constellation level, and enhancement flag.
- Supports an `update` method to apply partial changes.

### `AttributeControl`

- Responsible for building and storing the character's attribute values.
- Holds two snapshots: `attrs` (raw attributes, no bonuses) and `finals` (raw attributes with bonuses applied and percentage core stats added to core stats).
- With `init`, it computes `attrs` from the character's state, items, and bonuses from the team (if any).
- Provides a `get` method for reading stats from `attrs`.

### `BonusControl`

- Stores attribute and attack bonuses accumulated during a simulation.
- Provides read & write methods for these bonuses.

### `LevelBonusControl`

A `Map` of `TalentLevelBonus` entries keyed by bonus ID. These bonuses add levels to specific talent types (NAs, ES, EB).

### `Weapon` & `ArtifactGear`

The character's equipped items. Contributes attribute stats to `AttributeControl` during initialization.

---

## Calculation Flow

1. `initCalculation` resets `AttributeControl`, `BonusControl`, and `LevelBonusControl`, then seeds base attributes from the character, weapon, and artifact data.

2. External bonus sources (abilities, team buffs, etc.) populate `BonusControl` via `addAttrBonus` / `addAttkBonus`.

3. `finalizeAttrs` merges accumulated attribute bonuses into a resolved `finals` snapshot, including core stat scaling (base × percent).

4. Damage calculations read from `finals` and query `BonusControl` for attack bonuses.
