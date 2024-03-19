import { Green } from "../span";
import { GiModifierView, type GiModifierViewProps } from "../GiModifierView";

export function GeoResoDebuffItem(props: Pick<GiModifierViewProps, "mutable" | "checked" | "onToggle">) {
  return (
    <GiModifierView
      {...props}
      heading="Enduring Rock"
      description={
        <>
          Shielded characters dealing DMG to enemies will decrease their <Green>Geo RES</Green> by <Green b>20%</Green>{" "}
          for 15s.
        </>
      }
    />
  );
}
