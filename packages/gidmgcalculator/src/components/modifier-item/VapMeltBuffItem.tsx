import { round } from "rond";

import type { AmplifyingReaction, ElementType, ReactionBonus } from "@Src/types";
import { Calculation_ } from "@Src/utils";
import { Green } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

interface VapMeltBuffItemProps extends Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: AmplifyingReaction;
  element: ElementType;
  rxnBonus: ReactionBonus;
}
export function VapMeltBuffItem({ reaction, element, rxnBonus, ...rest }: VapMeltBuffItemProps) {
  const mult = Calculation_.getAmplifyingMultiplier(element, rxnBonus)[reaction];

  return (
    <GenshinModifierView
      {...rest}
      heading={
        <>
          <span className="capitalize">{reaction}</span>{" "}
          <span className="text-light-800 font-normal">
            (vs {element === "pyro" ? (reaction === "melt" ? "Cryo" : "Hydro") : "Pyro"})
          </span>
        </>
      }
      description={
        <>
          Increases <span className={`text-${element} capitalize`}>{element} DMG</span> by{" "}
          <Green b>{round(mult, 3)}</Green> times.
        </>
      }
    />
  );
}
