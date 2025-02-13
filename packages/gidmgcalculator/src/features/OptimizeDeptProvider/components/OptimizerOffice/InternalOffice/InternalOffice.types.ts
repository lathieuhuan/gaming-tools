import type { ArtifactSetBonus } from "@Backend";
import type { ArtifactModCtrl, CalcArtifacts, CalcSetupManageInfo } from "@Src/types";

export type ProcessedSetup =
  | CalcSetupManageInfo
  | {
      ID: number;
      name: string;
      type: "optimized";
    };

export type ProcessedResult = {
  manageInfo: ProcessedSetup;
  artifacts: CalcArtifacts;
  setBonuses: ArtifactSetBonus[];
  artBuffCtrls: ArtifactModCtrl[];
  artDebuffCtrls: ArtifactModCtrl[];
}[];
