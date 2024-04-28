import { ElementType, GeneralCalc, Level, QuickenReaction, ReactionBonus } from "@Backend";

import { Green } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

interface QuickenBuffItemProps extends Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: QuickenReaction;
  element: ElementType;
  characterLv: Level;
  rxnBonus: ReactionBonus;
}
export function QuickenBuffItem({ reaction, element, characterLv, rxnBonus, ...rest }: QuickenBuffItemProps) {
  const value = GeneralCalc.getQuickenBuffDamage(characterLv, rxnBonus)[reaction];

  return (
    <GenshinModifierView
      {...rest}
      heading={
        <>
          <span className="capitalize">{reaction}</span>{" "}
          <span className="text-hint-color font-normal">
            ({element === "electro" ? "Electro" : "Dendro"} on Quicken)
          </span>
        </>
      }
      description={
        <>
          Increase base <span className={`text-${element} capitalize`}>{element} DMG</span> by <Green b>{value}</Green>.
        </>
      }
    />
  );
}
