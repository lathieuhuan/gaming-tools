import type { CustomDebuffCtrl, Resonance } from "@/types";
import { SuperconductDebuffItem, ModifierContainer } from "@/components";
import { useTranslation } from "@/hooks";

type ElementDebuffsProps = {
  superconduct: boolean;
  resonances: Resonance[];
};

export function ElementDebuffs({ superconduct, resonances }: ElementDebuffsProps) {
  return (
    <ModifierContainer type="debuffs" mutable={false}>
      {superconduct && <SuperconductDebuffItem mutable={false} />}
      {/* <GeoResoDebuffItem key="geo" mutable={false} /> */}
    </ModifierContainer>
  );
}

type CustomDebuffsProps = {
  customDebuffCtrls: CustomDebuffCtrl[];
};

export function CustomDebuffs({ customDebuffCtrls }: CustomDebuffsProps) {
  const { t } = useTranslation();

  return (
    <ModifierContainer type="debuffs" mutable={false}>
      {customDebuffCtrls.map(({ type, value }, i) => (
        <div key={i} className="flex justify-end">
          <p className="mr-4">{t(type, { ns: "resistance" })} reduction</p>
          <p className="w-12 shrink-0 text-heading text-right">{value}%</p>
        </div>
      ))}
    </ModifierContainer>
  );
}
