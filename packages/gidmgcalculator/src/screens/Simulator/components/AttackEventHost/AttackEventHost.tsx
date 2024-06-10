import { useState } from "react";
import { TRANSFORMATIVE_REACTIONS, TotalAttributeControl } from "@Backend";

import { useActiveMember, useToolbox } from "@Simulator/providers";
import { useTranslation } from "@Src/hooks";
import { getAttackEventConfigGroups, type AttackEventConfigGroup } from "./AttackEventHost.utils";

// Components
import { AttackEventGroup } from "./AttackEventGroup";
import { TalentAttackEvent } from "./TalentAttackEvent";

interface AttackEventHostProps {
  totalAttr: TotalAttributeControl;
  configGroups: AttackEventConfigGroup[];
}

function AttackEventHostCore({ configGroups, totalAttr }: AttackEventHostProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState({
    groupI: -1,
    itemI: -1,
  });

  console.log("render: AttackEventHostCore");

  const onClickKey = (groupI: number, itemI: number, active: boolean) => {
    setActive(active ? { groupI: -1, itemI: -1 } : { groupI, itemI });
  };

  return (
    <div className="h-full hide-scrollbar space-y-3">
      {configGroups.map((group, groupIndex) => {
        if (!group.items.length) {
          return null;
        }

        return (
          <AttackEventGroup
            key={group.name}
            name={t(group.name)}
            items={group.items}
            getItemState={(item, itemIndex) => ({
              label: item.name,
              isActive: groupIndex === active.groupI && itemIndex === active.itemI,
            })}
            renderContent={(item) => <TalentAttackEvent talentType={group.name} configItem={item} />}
            onClickItem={(_, index, active) => onClickKey(groupIndex, index, active)}
          />
        );
      })}
      <AttackEventGroup
        name={t("RXN_CALC")}
        items={[...TRANSFORMATIVE_REACTIONS]}
        getItemState={(item, itemIndex) => ({
          label: t(item),
          isActive: configGroups.length === active.groupI && itemIndex === active.itemI,
        })}
        renderContent={() => <p>Hello</p>}
        onClickItem={(_, index, active) => onClickKey(configGroups.length, index, active)}
      />
    </div>
  );
}

export function AttackEventHost({ className = "" }: { className?: string }) {
  const activeMember = useActiveMember();
  const toolbox = useToolbox();

  console.log("render: AttackEventHost");

  if (!activeMember || !toolbox) {
    return null;
  }

  return (
    <div className={"p-4 h-full rounded-md bg-surface-1 " + className}>
      <AttackEventHostCore
        totalAttr={toolbox.totalAttr}
        configGroups={getAttackEventConfigGroups(activeMember.appChar)}
      />
    </div>
  );
}
