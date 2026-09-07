import type {
  DbComplexSetup,
  DbSetup,
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

type DbSetupV6 = ExactOmit<DbSetup, "teammates"> & {
  teammates: RawTeammateV6[];
};

export type DatabaseDataV6 = ExactOmit<CurrentDatabaseData, "version" | "setups"> & {
  version: 6;
  setups: (DbSetupV6 | DbComplexSetup)[];
};
