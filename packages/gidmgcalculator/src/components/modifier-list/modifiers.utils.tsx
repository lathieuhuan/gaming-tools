import type { AppArtifact, ArtifactModifier } from "@Src/types";
import { parseArtifactDescription, toArray } from "@Src/utils";

export const getArtifactDescription = (data: AppArtifact, modifier: ArtifactModifier) => {
  return parseArtifactDescription(
    toArray(modifier.description).reduce<string>((acc, description) => {
      return `${acc} ${typeof description === "string" ? description : data.descriptions[description] || ""}`;
    }, "")
  );
};

export function renderModifiers(modifiers: (JSX.Element | null)[], type: "buffs" | "debuffs", mutable?: boolean) {
  return modifiers.some((modifier) => modifier !== null) ? (
    <div className={mutable ? "pt-2 space-y-3" : "space-y-2"}>{modifiers}</div>
  ) : (
    <p className="pt-6 pb-4 text-center">No {type} found</p>
  );
}
