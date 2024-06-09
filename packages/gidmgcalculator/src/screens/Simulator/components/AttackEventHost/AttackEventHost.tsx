import { useState } from "react";
import { AppCharacter, CalcItem, NORMAL_ATTACKS, TRANSFORMATIVE_REACTIONS } from "@Backend";

import { useTranslation } from "@Src/hooks";
import { useActiveMember } from "@Simulator/providers";
import { AttackEventGroup } from "./AttackEventGroup";

interface AttackEventHostProps {
  configGroups: ConfigGroup[];
}

function AttackEventHostCore({ configGroups }: AttackEventHostProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState({
    groupI: -1,
    itemI: -1,
  });

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
            renderContent={() => <p>Hello</p>}
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

  if (!activeMember) {
    return null;
  }

  return (
    <div className={"p-4 h-full rounded-md bg-surface-1 " + className}>
      <AttackEventHostCore configGroups={getAttackConfig(activeMember.appChar)} />
    </div>
  );
}

type ConfigGroup = {
  name: string;
  items: CalcItem[];
};

function getAttackConfig(appChar: AppCharacter) {
  const filter = (items: CalcItem[], cb: (item: CalcItem) => void) => {
    for (const item of items) {
      if (!item.type || item.type === "attack") cb(item);
    }
  };

  const NAs: ConfigGroup = {
    name: "NAs",
    items: [],
  };
  for (const NA of NORMAL_ATTACKS) {
    filter(appChar.calcList[NA], (item) => NAs.items.push(item));
  }

  const talentAttacks: ConfigGroup[] = [NAs];

  for (const attPatt of ["ES", "EB"] as const) {
    const group: ConfigGroup = {
      name: attPatt,
      items: [],
    };
    filter(appChar.calcList[attPatt], (item) => group.items.push(item));

    talentAttacks.push(group);
  }

  return talentAttacks;
}
