import { Fragment, useEffect, useState } from "react";
import { round } from "rond";
import { ATTACK_ELEMENTS, AppWeapon, GeneralCalc, TotalAttribute } from "@Backend";

import type { SimulationAttackBonus, SimulationAttributeBonus, SimulationMember } from "@Src/types";
import type { SimulationManager } from "@Simulator/ToolboxProvider";
import { ArtifactCard, AttributeTable, EquipmentDisplay, SetBonusesView, WeaponCard } from "@Src/components";
import { useTranslation } from "@Src/hooks";
import { suffixOf } from "@Src/utils";

export function AttributesTab({ simulation }: { simulation: SimulationManager }) {
  const [totalAttr, setTotalAttr] = useState<TotalAttribute | null>(null);

  useEffect(() => {
    if (simulation) {
      const { initialTotalAttr, unsubscribe } = simulation.subscribeTotalAttr(setTotalAttr);

      setTotalAttr(initialTotalAttr);
      return unsubscribe;
    }
    return undefined;
  }, [simulation]);

  return totalAttr ? <AttributeTable attributes={totalAttr} /> : null;
}

type SimulationBonus = SimulationAttributeBonus | SimulationAttackBonus;

const isAttackBonus = (bonus: SimulationBonus): bonus is SimulationAttackBonus => {
  return "toKey" in bonus;
};

interface BonusesTabProps {
  simulation: SimulationManager;
}
export function BonusesTab({ simulation }: BonusesTabProps) {
  const { t } = useTranslation();
  const [bonuses, setBonuses] = useState<SimulationBonus[]>([]);

  useEffect(() => {
    const { initial, unsubscribe } = simulation.subscribeBonuses((attrBonus, attkBonus) => {
      setBonuses((attrBonus as SimulationBonus[]).concat(attkBonus));
    });

    setBonuses([...initial.attrBonuses, ...initial.attkBonuses]);

    return unsubscribe;
  }, [simulation]);

  return (
    <div className="h-full hide-scrollbar space-y-2">
      {bonuses.map((bonus, index) => {
        const isAttkBonus = isAttackBonus(bonus);
        const valueType = isAttkBonus ? bonus.toKey : bonus.toStat;

        return (
          <Fragment key={index}>
            {index ? <div className="h-px bg-surface-border" /> : null}

            <div className="flex flex-col items-end rounded">
              <div className="text-bonus-color">
                <span className="text-lg font-semibold">
                  {round(bonus.value, 2)}
                  {suffixOf(valueType)}
                </span>{" "}
                {t(valueType)}
              </div>

              {isAttkBonus && (
                <div className="h-6 text-sm text-light-default/60">
                  <span>to</span>{" "}
                  <span className="capitalize">
                    {bonus.toType.split(".").map((type, index) => {
                      const text = ATTACK_ELEMENTS.includes(type as (typeof ATTACK_ELEMENTS)[number])
                        ? type === "phys"
                          ? "physical"
                          : type
                        : t(type);

                      return (
                        <Fragment key={index}>
                          {index ? " & " : null}
                          <span key={index} className="text-secondary-1">
                            {text}
                          </span>
                        </Fragment>
                      );
                    })}
                  </span>
                </div>
              )}

              <p className="text-sm text-right">
                <span className="text-light-default/60">from</span>{" "}
                <span className="font-medium">{bonus.description}</span>
              </p>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

interface EquipmentTabProps {
  weapon: SimulationMember["weapon"];
  appWeapon: AppWeapon;
  artifacts: SimulationMember["artifacts"];
}
export function EquipmentTab({ weapon, appWeapon, artifacts }: EquipmentTabProps) {
  const [detailIndex, setDetailIndex] = useState(-1);

  const onClickItem = (index: number) => {
    setDetailIndex(index === detailIndex ? -1 : index);
  };

  return (
    <div>
      <EquipmentDisplay
        className="mb-3"
        compact
        selectedIndex={detailIndex}
        weapon={weapon}
        appWeapon={appWeapon}
        artifacts={artifacts}
        onClickItem={onClickItem}
      />

      {detailIndex === 5 ? (
        <WeaponCard weapon={weapon} mutable={false} withGutter={false} />
      ) : detailIndex >= 0 ? (
        <ArtifactCard artifact={artifacts[detailIndex] ?? undefined} mutable={false} withGutter={false} />
      ) : (
        <SetBonusesView noTitle setBonuses={GeneralCalc.getArtifactSetBonuses(artifacts)} />
      )}
    </div>
  );
}
