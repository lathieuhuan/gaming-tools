import type { BasicSetupType } from "./calculator";
import type { RawCharacter, RawTeammate, RawTarget } from "./entity";
import {
  ArtifactModCtrlState,
  CustomDebuffCtrl,
  CustomBuffCtrl,
  ElementalEvent,
  ResonanceModCtrl,
} from "./modifier-controls";
import { ModifierCtrlState } from "./modifier-controls";

export type DbCharacter = RawCharacter & {
  weaponID: number;
  artifactIDs: number[];
};

export type DbSetup = {
  ID: number;
  type: BasicSetupType;
  name: string;

  main: DbCharacter;

  selfBuffCtrls: ModifierCtrlState[];
  selfDebuffCtrls: ModifierCtrlState[];

  wpBuffCtrls: ModifierCtrlState[];
  artBuffCtrls: ArtifactModCtrlState[];
  artDebuffCtrls: ArtifactModCtrlState[];

  teammates: RawTeammate[];
  teamBuffCtrls: ModifierCtrlState[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];

  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  target: RawTarget;
};

export type DbComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};
