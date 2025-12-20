import type { CustomDebuffCtrl, ResonanceModCtrl } from "@/types";
import { useTranslation } from "@/hooks";

import { ModifierContainer, ResonanceDebuffItem, GenshinModifierView } from "@/components";
import { SUPERCONDUCT_DEBUFF_CONFIG } from "@/components/modifier-item/configs";

type ElementDebuffsProps = {
  superconduct: boolean;
  rsnDebuffCtrls: ResonanceModCtrl[];
};

export function ElementDebuffs({ superconduct, rsnDebuffCtrls }: ElementDebuffsProps) {
  return (
    <ModifierContainer type="debuffs" mutable={false}>
      {rsnDebuffCtrls.map((ctrl) => {
        return (
          <ResonanceDebuffItem
            key={ctrl.element}
            mutable={false}
            element={ctrl.element}
            checked={ctrl.activated}
          />
        );
      })}
      {superconduct && <GenshinModifierView mutable={false} {...SUPERCONDUCT_DEBUFF_CONFIG} />}
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
