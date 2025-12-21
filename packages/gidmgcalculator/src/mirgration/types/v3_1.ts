import type { ExactOmit } from "rond";

import type {
  AttackElement,
  AttackReaction,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementType,
  IDbComplexSetup,
  ITargetBasic,
  Level,
  NormalAttack,
  WeaponType,
} from "@/types";
import type { DatabaseDataV3 } from "./v3";

// ========== SETUP ==========

type ModifierCtrl = {
  activated: boolean;
  /** This is WeaponBuff.index / ArtifactBuff.index / CharacterModifier.index */
  index: number;
  inputs?: number[];
  /** Control with teamBuffId is just a placeholder for the actual control in setup.teamBuffCtrls */
  teamBuffId?: string;
};

type ArtifactModifierCtrl = ModifierCtrl & {
  code: number;
};

type IDbTeammate = {
  name: string;
  enhanced?: boolean;
  buffCtrls: ModifierCtrl[];
  debuffCtrls: ModifierCtrl[];
  weapon: {
    code: number;
    type: WeaponType;
    refi: number;
    buffCtrls: ModifierCtrl[];
  };
  artifact: {
    code: number;
    buffCtrls: ModifierCtrl[];
  };
};

type Resonance = {
  vision: ElementType;
  activated: boolean;
  inputs?: number[];
};

type ElementModCtrl = {
  reaction: AttackReaction;
  infuse_reaction: AttackReaction;
  absorb_reaction: AttackReaction;
  absorption: ElementType | null;
  superconduct: boolean;
  resonances: Resonance[];
};

type TeamBuffCtrl = {
  id: number;
  activated: boolean;
  inputs?: number[];
};

type Setup = {
  ID: number;
  type: "original" | "combined";
  name: string;

  char: {
    name: string;
    level: Level;
    NAs: number;
    ES: number;
    EB: number;
    cons: number;
  };
  selfBuffCtrls: ModifierCtrl[];
  selfDebuffCtrls: ModifierCtrl[];

  wpBuffCtrls: ModifierCtrl[];
  artBuffCtrls: ArtifactModifierCtrl[];
  artDebuffCtrls: ArtifactModifierCtrl[];
  teamBuffCtrls: TeamBuffCtrl[];

  party: (IDbTeammate | null)[];
  elmtModCtrls: ElementModCtrl;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  customInfusion: {
    element: AttackElement;
    range?: NormalAttack[];
  };

  weaponID: number;
  artifactIDs: (number | null)[];
  target: ITargetBasic;
};

export type DatabaseDataV3_1 = ExactOmit<DatabaseDataV3, "version" | "setups"> & {
  version: 3.1;
  setups: (Setup | IDbComplexSetup)[];
};
