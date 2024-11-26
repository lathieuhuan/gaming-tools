import { AppArtifact } from "../../src/backend";
import { $AppArtifact } from "../../src/services";

export enum __EMockArtifactSet {
  DEFAULT = 1,
}

export const __artifacts: AppArtifact[] = [
  {
    code: __EMockArtifactSet.DEFAULT,
    descriptions: [],
    name: "",
    variants: [4, 5],
    flower: { name: "", icon: "" },
    plume: { name: "", icon: "" },
    sands: { name: "", icon: "" },
    goblet: { name: "", icon: "" },
    circlet: { name: "", icon: "" },
  },
];

$AppArtifact.populate(__artifacts);
