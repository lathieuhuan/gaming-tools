import { Green } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

export function GeoResoDebuffItem(props: Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle">) {
  return (
    <GenshinModifierView
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
