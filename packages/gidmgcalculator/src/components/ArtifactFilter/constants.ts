import { ArtifactFilterCondition } from "./types";

export const DEFAULT_ARTIFACT_FILTER: ArtifactFilterCondition = {
  stats: {
    main: "All",
    subs: Array(4).fill("All"),
  },
  codes: [],
  types: [],
};
