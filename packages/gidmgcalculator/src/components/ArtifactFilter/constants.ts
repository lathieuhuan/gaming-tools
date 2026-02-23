import { ArtifactFilterCondition } from "./types";

export const DEFAULT_ARTIFACT_FILTER: ArtifactFilterCondition = {
  stats: {
    main: "All",
    subs: Array.from({ length: 4 }, () => "All"),
  },
  codes: [],
  types: [],
};
