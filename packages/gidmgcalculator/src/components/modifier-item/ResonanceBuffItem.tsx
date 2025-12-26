import type { ElementType, ModInputConfig } from "@/types";

import Array_ from "@/utils/Array";
import { parseDescription } from "@/utils/description-parsers";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

type RenderInfo = {
  heading: string;
  desc: string | string[];
  inputConfigs?: ModInputConfig[];
};

export const RESONANCE_BUFFS: Record<string, RenderInfo> = {
  cryo: {
    heading: "Cryo Resonance",
    desc: "Increases {CRIT Rate}#[k] against enemies that are Frozen or affected by Cryo by {15%}#[v].",
  },
  geo: {
    heading: "Geo Resonance",
    desc: "Increases {DMG}#[k] of shielded characters, or characters nearby Moondrifts, by {15%}#[v].",
  },
  dendro: {
    heading: "Dendro Resonance",
    desc: [
      `After triggering Aggravate, Spread, Hyperbloom, or Burgeon reactions, all nearby party members gain {20}#[v] {Elemental Mastery}#[k] for 6s.`,
      `After triggering Burning, Quicken, or Bloom reactions, all nearby party members gain {30}#[v] {Elemental Mastery}#[k] for 6s.`,
    ],
    inputConfigs: [
      { label: "Trigger Aggravate, Spread, Hyperbloom, Burgeon", type: "CHECK" },
      { label: "Trigger Burning, Quicken, Bloom", type: "CHECK" },
    ],
  },
};

type ResonanceBuffItemProps = Omit<
  GenshinModifierViewProps,
  "heading" | "description" | "inputConfigs"
> & {
  element: ElementType;
};

export function ResonanceBuffItem({ element, ...props }: ResonanceBuffItemProps) {
  if (!RESONANCE_BUFFS[element]) {
    return null;
  }

  const { heading, desc, inputConfigs } = RESONANCE_BUFFS[element];
  const parsedDesc = Array_.toArray(desc)
    .map((part) => parseDescription(part))
    .join(" ");

  return (
    <GenshinModifierView
      {...props}
      heading={heading}
      description={parsedDesc}
      inputConfigs={inputConfigs}
      headingVariant={element === "dendro" ? "view" : props.headingVariant}
    />
  );
}
