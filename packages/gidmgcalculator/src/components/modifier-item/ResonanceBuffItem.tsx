import type { ElementType } from "@Backend";
import { Green } from "@Src/components";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

const resonanceRenderInfo: Record<string, { name: string; description: JSX.Element }> = {
  pyro: {
    name: "Fervent Flames",
    description: (
      <>
        Increases <Green>ATK</Green> by <Green b>25%</Green>.
      </>
    ),
  },
  cryo: {
    name: "Shattering Ice",
    description: (
      <>
        Increases <Green>CRIT Rate</Green> against enemies that are Frozen or affected by Cryo by <Green b>15%</Green>.
      </>
    ),
  },
  geo: {
    name: "Enduring Rock",
    description: (
      <>
        Increases <Green>Shield Strength</Green> by <Green b>15%</Green>. Increases <Green>DMG</Green> dealt by
        characters that protected by a shield by <Green b>15%</Green>.
      </>
    ),
  },
  hydro: {
    name: "Soothing Water",
    description: (
      <>
        Increases <Green>Max HP</Green> by <Green b>25%</Green>.
      </>
    ),
  },
  dendro: {
    name: "Sprawling Greenery",
    description: (
      <>
        Increases <Green>Elemental Mastery</Green> by <Green b>50</Green>. After triggering Burning, Quicken, or Bloom
        reactions, all nearby party members gain <Green>30</Green> <Green>Elemental Mastery</Green> for 6s. After
        triggering Aggravate, Spread, Hyperbloom, or Burgeon reactions, all nearby party members gain <Green>20</Green>{" "}
        <Green>Elemental Mastery</Green> for 6s. The durations of the aforementioned effects will be counted
        independently.
      </>
    ),
  },
};

interface ResonanceBuffItemProps extends Omit<GenshinModifierViewProps, "heading" | "description"> {
  element: ElementType;
}

export function ResonanceBuffItem({ element, ...coreProps }: ResonanceBuffItemProps) {
  const { name, description } = resonanceRenderInfo[element] || {};
  return name ? <GenshinModifierView heading={name} description={description} {...coreProps} /> : null;
}
