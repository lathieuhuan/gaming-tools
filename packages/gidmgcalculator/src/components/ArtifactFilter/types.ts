import { AppArtifact } from "@Calculation";

export type ArtifactFilterSet = {
  code: number;
  chosen: boolean;
  icon: string;
  data: AppArtifact;
  count: number;
};
