import type { AppArtifact, ArtifactModifierDescription } from "@/types";

import Array_ from "../Array";
import { parseArtifactDesc } from "./parseArtifactDesc";

export function getArtifactDesc(
  data: AppArtifact,
  modifier: { description: ArtifactModifierDescription }
) {
  return parseArtifactDesc(
    Array_.toArray(modifier.description).reduce<string>((acc, description) => {
      const desc =
        typeof description === "string" ? description : data.descriptions[description] || "";

      return `${acc} ${desc}`;
    }, "")
  );
}
