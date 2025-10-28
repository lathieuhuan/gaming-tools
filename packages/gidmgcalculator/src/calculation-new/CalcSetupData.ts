import {
  ArtifactModCtrl,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementModCtrl,
  Infusion,
  ModifierCtrl,
  TeamBuffCtrl,
} from "@/types";
import { CharacterC } from "./Character";

export type CalcSetupDataConstructorParams = {
  char: CharacterC;
  selfBuffCtrls: ModifierCtrl[];
  selfDebuffCtrls: ModifierCtrl[];

  wpBuffCtrls: ModifierCtrl[];
  artBuffCtrls: ArtifactModCtrl[];
  artDebuffCtrls: ArtifactModCtrl[];
  teamBuffCtrls: TeamBuffCtrl[];

  party: (CharacterC | null)[];
  elmtModCtrls: ElementModCtrl;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  customInfusion: Infusion;
};

export class CalcSetupData implements CalcSetupDataConstructorParams {
  char: CharacterC;
  selfBuffCtrls: ModifierCtrl[];
  selfDebuffCtrls: ModifierCtrl[];
  wpBuffCtrls: ModifierCtrl[];
  artBuffCtrls: ArtifactModCtrl[];
  artDebuffCtrls: ArtifactModCtrl[];
  teamBuffCtrls: TeamBuffCtrl[];
  party: (CharacterC | null)[];
  elmtModCtrls: ElementModCtrl;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  customInfusion: Infusion;

  constructor(params: CalcSetupDataConstructorParams) {
    this.char = params.char;
    this.selfBuffCtrls = params.selfBuffCtrls;
    this.selfDebuffCtrls = params.selfDebuffCtrls;
    this.wpBuffCtrls = params.wpBuffCtrls;
    this.artBuffCtrls = params.artBuffCtrls;
    this.artDebuffCtrls = params.artDebuffCtrls;
    this.teamBuffCtrls = params.teamBuffCtrls;
    this.party = params.party;
    this.elmtModCtrls = params.elmtModCtrls;
    this.customBuffCtrls = params.customBuffCtrls;
    this.customDebuffCtrls = params.customDebuffCtrls;
    this.customInfusion = params.customInfusion;
  }
}
