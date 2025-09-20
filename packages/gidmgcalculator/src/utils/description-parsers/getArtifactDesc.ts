import { AppArtifact, ArtifactModifierDescription } from "@/calculation/types";
import Array_ from "../Array";
import { parseArtifactDesc } from "./parseArtifactDesc";

export function getArtifactDesc(data: AppArtifact, modifier: { description: ArtifactModifierDescription }) {
  return parseArtifactDesc(
    Array_.toArray(modifier.description).reduce<string>((acc, description) => {
      return `${acc} ${typeof description === "string" ? description : data.descriptions[description] || ""}`;
    }, "")
  );
}
