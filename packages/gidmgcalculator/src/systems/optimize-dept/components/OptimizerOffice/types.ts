import type { ArtifactSetBonus } from "@Calculation";
import type { ArtifactModCtrl, CalcArtifacts, CalcSetupManageInfo } from "@/types";

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
