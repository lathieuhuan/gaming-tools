import { Fragment, useEffect, useState } from "react";
import { round } from "rond";
import { ATTACK_ELEMENTS } from "@Backend";

import { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { SimulationManager } from "@Simulator/ToolboxProvider";

type SimulationBonus = SimulationAttributeBonus | SimulationAttackBonus;

interface BonusDisplayerProps {
  className?: string;
  simulation: SimulationManager;
}
export function BonusDisplayer({ className, simulation }: BonusDisplayerProps) {
  const { t } = useTranslation();
  const [bonuses, setBonuses] = useState<SimulationBonus[]>([]);

  useEffect(() => {
    const { initial, unsubscribe } = simulation.subscribeBonuses((attrBonus, attkBonus) => {
      setBonuses((attrBonus as SimulationBonus[]).concat(attkBonus));
    });

    setBonuses((initial.attrBonus as SimulationBonus[]).concat(initial.attkBonus));
    return unsubscribe;
  }, [simulation]);

  return (
    <div className={className}>
      <div className="h-full hide-scrollbar space-y-3">
        {bonuses.map((bonus, index) => {
          return (
            <Fragment key={index}>
              {index ? <div className="h-px bg-surface-border" /> : null}

              <div className="flex flex-col items-end rounded">
                <div className="text-bonus-color">
                  <span className="text-lg font-semibold">{round(bonus.value, 2)}</span>{" "}
                  {t(bonus.type === "ATTRIBUTE" ? bonus.toStat : bonus.toKey)}
                </div>

                {bonus.type === "ATTACK" && (
                  <div className="h-6 text-sm capitalize">
                    {bonus.toType.split(".").map((type, index) => {
                      const text = ATTACK_ELEMENTS.includes(type as (typeof ATTACK_ELEMENTS)[number])
                        ? type === "phys"
                          ? "physical"
                          : type
                        : t(type);

                      return (
                        <Fragment key={index}>
                          {index ? <span className="text-light-default/60"> & </span> : null}
                          <span key={index} className="text-secondary-1">
                            {text}
                          </span>
                        </Fragment>
                      );
                    })}
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-light-default/60">from</span>{" "}
                  <span className="font-medium">{bonus.description}</span>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
