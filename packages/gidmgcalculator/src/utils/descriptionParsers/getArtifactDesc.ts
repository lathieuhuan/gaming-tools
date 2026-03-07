import { Array_ } from "ron-utils";

import type { AppArtifact, ArtifactModifierDescription } from "@/types";
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
