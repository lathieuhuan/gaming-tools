import { AttackBonuses, AttackBonusesControl, ElementType, GeneralCalc, Level, QuickenReaction } from "@Calculation";

import { markGreen } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

interface QuickenBuffItemProps extends Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> {
  reaction: QuickenReaction;
  element: ElementType;
  characterLv: Level;
  attkBonuses: AttackBonuses;
}
export function QuickenBuffItem({ reaction, element, characterLv, attkBonuses, ...rest }: QuickenBuffItemProps) {
  const bonusValue = GeneralCalc.getQuickenBuffDamage(
    reaction,
    characterLv,
    AttackBonusesControl.get(attkBonuses, "pct_", reaction)
  );

  return (
    <GenshinModifierView
      {...rest}
      heading={
        <>
          <span className="capitalize">{reaction}</span>{" "}
          <span className="text-light-hint font-normal">
            ({element === "electro" ? "Electro" : "Dendro"} on Quicken)
          </span>
        </>
      }
      description={
        <>
          Increase base <span className={`text-${element} capitalize`}>{element} DMG</span> by{" "}
          {markGreen(bonusValue, "bold")}.
        </>
      }
    />
  );
}
