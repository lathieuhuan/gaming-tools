import type { ArtifactSetBonus } from "@Backend";
import type { ArtifactModCtrl } from "@Src/types";

export type ProcessedResult = {
  setBonuses: ArtifactSetBonus[];
  artBuffCtrls: ArtifactModCtrl[];
  artDebuffCtrls: ArtifactModCtrl[];
}[];
