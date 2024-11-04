import { AttackBonuses, AttackBonusControl, ElementType, GeneralCalc, Level, QuickenReaction } from "@Backend";

import { Green } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

interface QuickenBuffItemProps extends Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: QuickenReaction;
  element: ElementType;
  characterLv: Level;
  attBonus: AttackBonuses;
}
export function QuickenBuffItem({ reaction, element, characterLv, attBonus, ...rest }: QuickenBuffItemProps) {
  const bonusValue = GeneralCalc.getQuickenBuffDamage(
    reaction,
    characterLv,
    AttackBonusControl.getBonus(attBonus, "pct_", reaction)
  );

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
          Increase base <span className={`text-${element} capitalize`}>{element} DMG</span> by{" "}
          <Green b>{bonusValue}</Green>.
        </>
      }
    />
  );
}
