import type { GenshinUserBuild } from "@/services/enka";
import type { ArtifactType } from "@/types";

export type EnkaImportSection = "COVER" | "RESULTS" | "DETAIL";

export type EnkaSearchParams = {
  uid?: string;
  hoyo?: string;
};

export type SelectedBuild = GenshinUserBuild & {
  detailType: "CHARACTER" | "WEAPON" | ArtifactType;
};
