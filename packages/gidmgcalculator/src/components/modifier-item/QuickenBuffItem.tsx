import type { ElementType, Level, QuickenReaction, ReactionBonus } from "@Src/types";
import { Calculation_ } from "@Src/utils";
import { Green } from "../span";
import { GiModifierView, type GiModifierViewProps } from "../GiModifierView";

interface QuickenBuffItemProps extends Pick<GiModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: QuickenReaction;
  element: ElementType;
  characterLv: Level;
  rxnBonus: ReactionBonus;
}
export function QuickenBuffItem({ reaction, element, characterLv, rxnBonus, ...rest }: QuickenBuffItemProps) {
  const value = Calculation_.getQuickenBuffDamage(characterLv, rxnBonus)[reaction];

  return (
    <GiModifierView
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
