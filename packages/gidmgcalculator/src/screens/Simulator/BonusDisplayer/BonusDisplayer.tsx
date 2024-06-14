import { Fragment, useEffect, useState } from "react";
import { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import { useActiveMember } from "@Simulator/ToolboxProvider";
import { useTranslation } from "@Src/hooks";
import { ATTACK_ELEMENTS } from "@Backend";
import { round } from "rond";

type SimulationBonus = SimulationAttributeBonus | SimulationAttackBonus;

interface BonusDisplayerProps {
  className?: string;
}
export function BonusDisplayer(props: BonusDisplayerProps) {
  const { t } = useTranslation();
  const member = useActiveMember();
  const [bonuses, setBonuses] = useState<SimulationBonus[]>([]);

  useEffect(() => {
    if (member) {
      const { initial, unsubscribe } = member.tools.subscribeBonuses((attrBonus, attkBonus) => {
        setBonuses((attrBonus as SimulationBonus[]).concat(attkBonus));
      });

      setBonuses((initial.attrBonus as SimulationBonus[]).concat(initial.attkBonus));
      return unsubscribe;
    }
    return undefined;
  }, [member]);

  if (!member) {
    return null;
  }

  return (
    <div className={props.className}>
      <div className="h-full hide-scrollbar space-y-3">
        {bonuses.map((bonus, index) => {
          const title = `${bonus.trigger.character} / ${bonus.trigger.modifier}`;

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
                  <span className="text-light-default/60">from</span> <span className="font-medium">{title}</span>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
