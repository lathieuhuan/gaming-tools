import { markGreen } from "../span";
import { GenshinModifierView, type GenshinModifierViewProps } from "../GenshinModifierView";

export function GeoResoDebuffItem(props: Pick<GenshinModifierViewProps, "mutable" | "checked" | "onToggle">) {
  return (
    <GenshinModifierView
      {...props}
      heading="Enduring Rock"
      description={
        <>
          Shielded characters dealing DMG to enemies will decrease their {markGreen("Geo RES")} by{" "}
          {markGreen("20%", "bold")} for 15s.
        </>
      }
    />
  );
}
