import type { CustomDebuffCtrl, Resonance } from "@/types";
import { GeoResoDebuffItem, SuperconductDebuffItem, renderModifiers } from "@/components";
import { useTranslation } from "@/hooks";

type ElementDebuffsProps = {
  superconduct: boolean;
  resonances: Resonance[];
}

export function ElementDebuffs({ superconduct, resonances }: ElementDebuffsProps) {
  const content = [];

  if (superconduct) {
    content.push(<SuperconductDebuffItem key="sc" mutable={false} />);
  }
  if (resonances.some((rsn) => rsn.vision === "geo")) {
    content.push(<GeoResoDebuffItem key="geo" mutable={false} />);
  }

  return renderModifiers(content, "debuffs", false);
}

type CustomDebuffsProps = {
  customDebuffCtrls: CustomDebuffCtrl[];
};

export function CustomDebuffs({ customDebuffCtrls }: CustomDebuffsProps) {
  const { t } = useTranslation();

  const content = customDebuffCtrls.map(({ type, value }, i) => (
    <div key={i} className="flex justify-end">
      <p className="mr-4">{t(type, { ns: "resistance" })} reduction</p>
      <p className="w-12 shrink-0 text-heading text-right">{value}%</p>
    </div>
  ));
  return renderModifiers(content, "debuffs", false);
}
