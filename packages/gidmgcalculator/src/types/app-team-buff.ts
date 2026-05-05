import type { BonusSpec, ModifierBaseSpec, TeamConditionSpecs } from "./modifier-specs";

export type TeamBuffSpec = ModifierBaseSpec &
  TeamConditionSpecs & {
    src: string;
    description: string;
    effects?: BonusSpec | BonusSpec[];
  };
