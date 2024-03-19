import { Green } from "../span";
import { GiModifierView, type GiModifierViewProps } from "../GiModifierView";

export function SuperconductDebuffItem(props: Pick<GiModifierViewProps, "mutable" | "checked" | "onToggle">) {
  return (
    <GiModifierView
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
