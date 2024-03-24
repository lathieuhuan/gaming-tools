import type { CustomDebuffCtrl, Resonance } from "@Src/types";
import { GeoResoDebuffItem, SuperconductDebuffItem, renderModifiers } from "@Src/components";
import { useTranslation } from "@Src/hooks";

interface ElementDebuffsDetailProps {
  superconduct: boolean;
  resonances: Resonance[];
}
export function ElementDebuffsDetail({ superconduct, resonances }: ElementDebuffsDetailProps) {
  const content = [];

  if (superconduct) {
    content.push(<SuperconductDebuffItem key="sc" mutable={false} />);
  }
  if (resonances.some((rsn) => rsn.vision === "geo")) {
    content.push(<GeoResoDebuffItem key="geo" mutable={false} />);
  }

  return renderModifiers(content, "debuffs", false);
}

interface CustomDebuffsDetailProps {
  customDebuffCtrls: CustomDebuffCtrl[];
}
export function CustomDebuffsDetail({ customDebuffCtrls }: CustomDebuffsDetailProps) {
  const { t } = useTranslation();

  const content = customDebuffCtrls.map(({ type, value }, i) => (
    <div key={i} className="flex justify-end">
      <p className="mr-4">{t(type, { ns: "resistance" })} reduction</p>
      <p className="w-12 shrink-0 text-heading-color text-right">{value}%</p>
    </div>
  ));
  return renderModifiers(content, "debuffs", false);
}
