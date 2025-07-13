import { AppArtifact, ArtifactModifierDescription } from "@Src/calculation/types";
import Array_ from "../array-utils";
import { parseArtifactDescription } from "./parseArtifactDescription";

export function getArtifactDescription(data: AppArtifact, modifier: { description: ArtifactModifierDescription }) {
  return parseArtifactDescription(
    Array_.toArray(modifier.description).reduce<string>((acc, description) => {
      return `${acc} ${typeof description === "string" ? description : data.descriptions[description] || ""}`;
    }, "")
  );
}
