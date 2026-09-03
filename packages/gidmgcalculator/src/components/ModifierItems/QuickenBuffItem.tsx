import type { Character } from "@/models";
import type { ElementType, QuickenReaction } from "@/types";

import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";
import { PositiveText } from "@/components/Text";

type QuickenBuffItemProps = Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> & {
  reaction: QuickenReaction;
  element: ElementType;
  character: Character;
};

export function QuickenBuffItem({ reaction, element, character, ...rest }: QuickenBuffItemProps) {
  const bonusValue = character.getQuickenBuffDamage(reaction);

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
