import type { ElementType, ModInputConfig } from "@/types";

import Array_ from "@/utils/Array";
import { parseDescription } from "@/utils/description-parsers";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

type RenderInfo = {
  heading: string;
  desc: string | string[];
  inputConfigs?: ModInputConfig[];
};

export const RESONANCE_DEBUFFS: Record<string, RenderInfo> = {
  geo: {
    heading: "Geo Resonance",
    desc: "DMG from shielded characters, or characters nearby Moondrifts, decreases {Geo RES}#[k] by {20%}#[v] for 15s.",
  },
};

type ResonanceDebuffItemProps = Omit<
  GenshinModifierViewProps,
  "heading" | "description" | "inputConfigs"
> & {
  element: ElementType;
};

export function ResonanceDebuffItem({ element, ...props }: ResonanceDebuffItemProps) {
  if (!RESONANCE_DEBUFFS[element]) {
    return null;
  }

  const { heading, desc, inputConfigs } = RESONANCE_DEBUFFS[element];
  const parsedDesc = Array_.toArray(desc)
    .map((part) => parseDescription(part))
    .join(" ");

  return (
    <GenshinModifierView
      {...props}
      heading={heading}
      description={parsedDesc}
      inputConfigs={inputConfigs}
    />
  );
}
