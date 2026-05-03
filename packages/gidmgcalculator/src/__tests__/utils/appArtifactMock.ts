import { AppArtifact } from "@/types";

export function __appArtifactMock(code: number, data?: Partial<AppArtifact>): AppArtifact {
  return {
    code,
    name: "",
    variants: [4, 5],
    flower: { name: "", icon: "" },
    plume: { name: "", icon: "" },
    sands: { name: "", icon: "" },
    goblet: { name: "", icon: "" },
    circlet: { name: "", icon: "" },
    descriptions: [],
    setBonuses: [],
    ...data,
  };
}
