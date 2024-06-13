import { useEffect, useState } from "react";
import { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import { ActiveMemberInfo, useActiveMember } from "@Simulator/ToolboxProvider";
import { useTranslation } from "@Src/hooks";

type SimulationBonus = SimulationAttributeBonus | SimulationAttackBonus;

interface BonusDisplayerProps {
  member: ActiveMemberInfo;
}
export function BonusDisplayerCore({ member }: BonusDisplayerProps) {
  const { t } = useTranslation();
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

  console.log("render: BonusDisplayerCore");
  console.log(bonuses);

  const renderAttkBonusType = (bonus: SimulationAttackBonus) => {
    let label = "";

    if (bonus.toType === "all") {
      label = "All";
    } else {
      for (const text of bonus.toType.split(".")) {
        label += label ? ` + ${t(text)}` : t(text);
      }
      label = `${label}`;
    }

    return <div>to {label} DMG</div>;
  };

  return (
    <div className="h-full hide-scrollbar space-y-3">
      {bonuses.map((bonus) => {
        const title = `${bonus.trigger.character} / ${bonus.trigger.modifier}`;

        return (
          <div key={title} className="p-3 flex flex-col items-end bg-surface-1 rounded">
            <div className="text-lg text-bonus-color">
              <span className="font-semibold">{bonus.value}</span>{" "}
              {t(bonus.type === "ATTRIBUTE" ? bonus.toStat : bonus.toKey)}
            </div>

            {bonus.type === "ATTACK" && renderAttkBonusType(bonus)}

            <div className="mt-1 text-sm">
              Source: <span className="text-primary-1 font-semibold">{title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BonusDisplayer(props: { className?: string }) {
  const activeMember = useActiveMember();

  console.log("render: BonusDisplayer");

  if (!activeMember) {
    return null;
  }

  return (
    <div className={props.className}>
      <BonusDisplayerCore member={activeMember} />
    </div>
  );
}
