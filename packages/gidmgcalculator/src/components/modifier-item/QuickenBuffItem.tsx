import type { ElementType, Level, QuickenReaction, ReactionBonus } from "@Src/types";
import { Calculation_ } from "@Src/utils";
import { Green } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

interface QuickenBuffItemProps extends Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: QuickenReaction;
  element: ElementType;
  characterLv: Level;
  rxnBonus: ReactionBonus;
}
export function QuickenBuffItem({ reaction, element, characterLv, rxnBonus, ...rest }: QuickenBuffItemProps) {
  const value = Calculation_.getQuickenBuffDamage(characterLv, rxnBonus)[reaction];

  return (
    <GenshinModifierView
      {...rest}
      heading={
        <>
          <span className="capitalize">{reaction}</span>{" "}
          <span className="text-light-800 font-normal">
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
