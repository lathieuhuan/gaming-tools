import type { ExactOmit } from "rond";
import type { CurrentDatabaseData } from "./current";
import type { AttackReaction, DbComplexSetup, DbSetup, ElementType } from "@/types";

type ElementalEventV5 = {
  reaction: AttackReaction;
  absorption: ElementType | null;
  absorbReaction: AttackReaction;
  infusion: ElementType | null;
  infuseReaction: AttackReaction;
  superconduct: boolean;
};

type DbSetupV5 = ExactOmit<DbSetup, "elmtEvent"> & {
  elmtEvent: ElementalEventV5;
};

export type DatabaseDataV5 = ExactOmit<CurrentDatabaseData, "version" | "setups"> & {
  version: 5;
  setups: (DbSetupV5 | DbComplexSetup)[];
};
