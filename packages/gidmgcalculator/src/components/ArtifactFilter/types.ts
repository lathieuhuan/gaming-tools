import { AppArtifact, ArtifactType, AttributeStat } from "@Calculation";

export type ArtifactFilterSet = {
  code: number;
  chosen: boolean;
  icon: string;
  data: AppArtifact;
  count: number;
};

export type ArtifactStatFilterOption = "All" | AttributeStat;

export type ArtifactStatFilterCondition = {
  main: ArtifactStatFilterOption;
  subs: ArtifactStatFilterOption[];
};

export type ArtifactFilterCondition = {
  stats: ArtifactStatFilterCondition;
  codes: number[];
  types: ArtifactType[];
};
