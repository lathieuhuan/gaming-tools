import { round } from "ron-utils";

import type { Character } from "@/models";
import type { AmplifyingReaction, ElementType } from "@/types";

import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";
import { markGreen } from "../Span";

type VapMeltBuffItemProps = Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle"> & {
  reaction: AmplifyingReaction;
  element: ElementType;
  character: Character;
};

export function VapMeltBuffItem({ reaction, element, character, ...rest }: VapMeltBuffItemProps) {
  const mult = character.getAmplifyingMult(reaction, element);

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
