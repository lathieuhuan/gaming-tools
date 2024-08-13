import type { ElementType, ModInputConfig } from "@Backend";

import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";
import { parseResonanceDescription, toArray } from "@Src/utils";

type RenderInfo = {
  name: string;
  description: string | string[];
  inputConfigs?: ModInputConfig[];
};

export const RESONANCE_INFO: Record<string, RenderInfo> = {
  pyro: {
    name: "Pyro Resonance",
    description: "Increases {ATK}#[k] by {25%}#[v].",
  },
  cryo: {
    name: "Cryo Resonance",
    description: "Increases {CRIT Rate}#[k] against enemies that are Frozen or affected by Cryo by {15%}#[v].",
  },
  geo: {
    name: "Geo Resonance",
    description: [
      "Increases {Shield Strength}#[k] by {15%}#[v].",
      "Increases {DMG}#[k] dealt by characters that protected by a shield by {15%}#[v].",
    ],
  },
  hydro: {
    name: "Hydro Resonance",
    description: "Increases {Max HP}#[k] by {25%}#[v].",
  },
  dendro: {
    name: "Dendro Resonance",
    description: [
      `Increases {Elemental Mastery}#[k] by {50}#[v].`,
      `After triggering Burning, Quicken, or Bloom reactions, all nearby party members gain {30}#[v] {Elemental Mastery}#[k] for 6s.`,
      `After triggering Aggravate, Spread, Hyperbloom, or Burgeon reactions, all nearby party members gain {20}#[v] {Elemental Mastery}#[k] for 6s.`,
    ],
    inputConfigs: [
      { label: "Trigger Aggravate, Spread, Hyperbloom, Burgeon", type: "CHECK" },
      { label: "Trigger Burning, Quicken, Bloom", type: "CHECK" },
    ],
  },
};

interface ResonanceBuffItemProps extends Omit<GenshinModifierViewProps, "heading" | "description"> {
  element: ElementType;
  description?: string;
}
export function ResonanceBuffItem({ element, ...coreProps }: ResonanceBuffItemProps) {
  const info = RESONANCE_INFO[element] || {};
  const { description = info.description } = coreProps;
  const parsedDescription = toArray(description)
    .map((part) => parseResonanceDescription(part))
    .join(" ");

  return info.name ? <GenshinModifierView heading={info.name} {...coreProps} description={parsedDescription} /> : null;
}
