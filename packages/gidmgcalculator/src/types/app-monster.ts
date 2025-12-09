import type { AttackElement, ElementType } from "./common";

type MonsterResistance = Partial<Record<AttackElement, number>> & {
  base: number;
};

type MonsterVariant = {
  types: ElementType[] | Array<{ label: string; value: ElementType }>;
  change?: number;
};

export type MonsterInputChanges = Partial<Record<"base" | "variant" | AttackElement, number>>;

export type MonsterInputConfig = {
  label: string;
  type?: "CHECK" | "SELECT";
  changes?: MonsterInputChanges;
  options?:
    | ElementType[]
    | Array<{
        label: string;
        changes: MonsterInputChanges;
      }>;
  optionChange?: number;
};

export type AppMonster = {
  code: number;
  title: string;
  subtitle?: string;
  names?: string[];
  resistance: MonsterResistance;
  variant?: MonsterVariant;
  inputConfigs?: MonsterInputConfig | MonsterInputConfig[];
};
