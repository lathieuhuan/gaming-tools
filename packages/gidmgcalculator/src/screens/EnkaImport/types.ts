import { GenshinUserBuild } from "@/services/enka";

export type SearchParams = {
  uid?: string;
  profile?: string;
};

export type SelectedBuild = GenshinUserBuild & {
  detailType: "CHARACTER" | "WEAPON" | number;
};
