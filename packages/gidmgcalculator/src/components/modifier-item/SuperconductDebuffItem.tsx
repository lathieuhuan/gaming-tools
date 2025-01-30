import { markGreen } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

export function SuperconductDebuffItem(props: Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle">) {
  return (
    <GenshinModifierView
      {...props}
      heading="Superconduct"
      description={
        <>
          Reduces the {markGreen("Physical RES")} of enemies by {markGreen("40%", "bold")} for 12 seconds.
        </>
      }
    />
  );
}
