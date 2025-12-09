import type { AutoRsnElmtType } from "@/types";

import { parseDescription } from "@/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";

const AUTO_RESONANCE_DESCS: Record<AutoRsnElmtType, string> = {
  pyro: "Increases {ATK}#[k] by {25%}#[v].",
  geo: "Increases {Shield Strength}#[k] by {15%}#[v].",
  hydro: "Increases {Max HP}#[k] by {25%}#[v].",
  dendro: `Increases {Elemental Mastery}#[k] by {50}#[v].`,
};

type AutoResonanceBuffsProps = {
  resonances: AutoRsnElmtType[];
};

export function AutoResonanceBuffs({ resonances }: AutoResonanceBuffsProps) {
  return resonances
    .filter((resonance) => resonance in AUTO_RESONANCE_DESCS)
    .map((resonance) => {
      const prefix = resonance.charAt(0).toUpperCase() + resonance.slice(1);

      return (
        <GenshinModifierView
          key={resonance}
          mutable={false}
          heading={`${prefix} Resonance`}
          description={parseDescription(AUTO_RESONANCE_DESCS[resonance])}
        />
      );
    });
}
