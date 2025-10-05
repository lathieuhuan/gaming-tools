import { round } from "rond";
import { GeneralCalc, AmplifyingReaction, ElementType, AttackBonuses, AttackBonusesControl } from "@Calculation";

import { markGreen } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

interface VapMeltBuffItemProps extends Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: AmplifyingReaction;
  element: ElementType;
  attkBonuses: AttackBonuses;
}
export function VapMeltBuffItem({ reaction, element, attkBonuses, ...rest }: VapMeltBuffItemProps) {
  const mult = GeneralCalc.getAmplifyingMultiplier(
    reaction,
    element,
    AttackBonusesControl.get(attkBonuses, "pct_", reaction)
  );

  return (
    <GenshinModifierView
      {...rest}
      heading={
        <>
          <span className="capitalize">{reaction}</span>{" "}
          <span className="text-light-hint font-normal">
            (vs {element === "pyro" ? (reaction === "melt" ? "Cryo" : "Hydro") : "Pyro"})
          </span>
        </>
      }
      description={
        <>
          Increases <span className={`text-${element} capitalize`}>{element} DMG</span> by{" "}
          {markGreen(round(mult, 3), "bold")} times.
        </>
      }
    />
  );
}
