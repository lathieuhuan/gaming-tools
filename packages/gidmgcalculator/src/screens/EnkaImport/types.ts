import type { GenshinUserBuild } from "@/services/enka";

export type EnkaImportSection = "COVER" | "RESULTS" | "DETAIL";

export type SearchParams = {
  uid?: string;
  profile?: string;
};

export type SelectedBuild = GenshinUserBuild & {
  detailType: "CHARACTER" | "WEAPON" | number;
};
