import type { AppArtifact, ArtifactModifier } from "@Src/types";
import { parseArtifactDescription, toArray } from "@Src/utils";

export function getArtifactDescription(data: AppArtifact, modifier: ArtifactModifier) {
  return parseArtifactDescription(
    toArray(modifier.description).reduce<string>((acc, description) => {
      return `${acc} ${typeof description === "string" ? description : data.descriptions[description] || ""}`;
    }, "")
  );
}

export function renderModifiers(modifiers: (JSX.Element | null)[], type: "buffs" | "debuffs", mutable?: boolean) {
  return modifiers.some((modifier) => modifier !== null) ? (
    <div className={`pt-2 ${mutable ? "space-y-3" : "space-y-2"}`}>{modifiers}</div>
  ) : (
    <p className="pt-6 pb-4 text-center text-hint-color">No {type} found</p>
  );
}
