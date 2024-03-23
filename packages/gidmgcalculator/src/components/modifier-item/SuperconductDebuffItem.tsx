import { Green } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

export function SuperconductDebuffItem(props: Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle">) {
  return (
    <GenshinModifierView
      {...props}
      heading="Superconduct"
      description={
        <>
          Reduces the <Green>Physical RES</Green> of enemies by <Green b>40%</Green> for 12 seconds.
        </>
      }
    />
  );
}
