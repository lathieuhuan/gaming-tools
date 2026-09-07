import type {
  AttackReaction,
  DbComplexSetup,
  DbSetup,
  ElementType,
  ModifierCtrlState,
  RawTeammateState,
  TeammateArtifactState,
  TeammateWeaponState,
} from "@/types";
import type { ExactOmit } from "rond";
import type { CurrentDatabaseData } from "./current";

type RawTeammateV6 = RawTeammateState & {
  buffCtrls: ModifierCtrlState[];
  debuffCtrls: ModifierCtrlState[];
  weapon: TeammateWeaponState & {
    buffCtrls: ModifierCtrlState[];
  };
  artifact?: TeammateArtifactState & {
    buffCtrls: ModifierCtrlState[];
  };
};

type ElementalEventV5 = {
  reaction: AttackReaction;
  absorption: ElementType | null;
  absorbReaction: AttackReaction;
  infusion: ElementType | null;
  infuseReaction: AttackReaction;
  superconduct: boolean;
};

type DbSetupV5 = ExactOmit<DbSetup, "teammates" | "elmtEvent"> & {
  teammates: RawTeammateV6[];
  elmtEvent: ElementalEventV5;
};

export type DatabaseDataV5 = ExactOmit<CurrentDatabaseData, "version" | "setups"> & {
  version: 5;
  setups: (DbSetupV5 | DbComplexSetup)[];
};
