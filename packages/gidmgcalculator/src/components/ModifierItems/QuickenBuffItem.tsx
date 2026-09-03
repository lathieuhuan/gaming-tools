import type { Character } from "@/models";
import type { ElementType, QuickenReaction } from "@/types";

import { PositiveText } from "@/components/Text";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

type QuickenBuffItemProps = Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> & {
  reaction: QuickenReaction;
  element: ElementType;
  character: Character;
};

export function QuickenBuffItem({ reaction, element, character, ...rest }: QuickenBuffItemProps) {
  const bonusValue = character.quickenDamageBonus(reaction);

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
          <PositiveText bold>{bonusValue}</PositiveText>.
        </>
      }
    />
  );
}
