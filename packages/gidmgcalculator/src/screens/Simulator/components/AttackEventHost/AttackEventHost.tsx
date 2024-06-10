import { useState } from "react";
import { AttackBonusControl, TRANSFORMATIVE_REACTIONS, TalentType, configTalentEvent } from "@Backend";
import type { RootState } from "@Store/store";

import {
  ActiveMemberInfo,
  SimulatorToolbox,
  useActiveMember,
  useActiveSimulation,
  useToolbox,
} from "@Simulator/providers";
import { useTranslation } from "@Src/hooks";
import { useSelector } from "@Store/hooks";
import { getActiveMember } from "@Simulator/Simulator.utils";
import {
  AttackEventConfigItem,
  getAttackEventConfigGroups,
  type AttackEventConfigGroup,
} from "./AttackEventHost.utils";

// Components
import { AttackEventGroup } from "./AttackEventGroup";
import { TalentAttackEvent } from "./TalentAttackEvent";

const selectAttackBonus = (state: RootState) => getActiveMember(state)?.attackBonus ?? [];

interface AttackEventHostProps {
  activeMember: ActiveMemberInfo;
  toolbox: SimulatorToolbox;
  configGroups: AttackEventConfigGroup[];
}

function AttackEventHostCore({ activeMember, toolbox, configGroups }: AttackEventHostProps) {
  const { t } = useTranslation();
  const activeSimulation = useActiveSimulation();

  const attackBonus = useSelector(selectAttackBonus);

  const [active, setActive] = useState({
    groupI: -1,
    itemI: -1,
  });

  console.log("render: AttackEventHostCore");

  if (!activeSimulation) {
    return null;
  }

  const onExpandTalentEvent = (groupI: number, itemI: number, active: boolean) => {
    setActive(active ? { groupI: -1, itemI: -1 } : { groupI, itemI });
  };

  const getTalentEventConfig = (talentType: TalentType, configItem: AttackEventConfigItem) => {
    const attBonus = new AttackBonusControl();

    for (const bonus of attackBonus) {
      attBonus.add(bonus.toType, bonus.toKey, bonus.value, "");
    }

    return configTalentEvent({
      underPattern: configItem.underPatt,
      talentType,
      totalAttr: toolbox.totalAttr.finalize(),
      attBonus,
      configItem,
      info: {
        char: activeMember.char,
        appChar: activeMember.appChar,
        partyData: activeSimulation.partyData,
      },
      elmtModCtrls: {
        absorption: null,
        infuse_reaction: null,
        reaction: null,
      },
      target: activeSimulation.target,
    });
  };

  const onPerformTalentEvent = (talentType: TalentType, configItem: AttackEventConfigItem) => {
    const config = getTalentEventConfig(talentType, configItem);

    if (config) {
      console.log("perform", config.damage);
    }
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
            renderContent={(item) => <TalentAttackEvent config={getTalentEventConfig(group.name, item)} />}
            onPerformEvent={(item) => onPerformTalentEvent(group.name, item)}
            onExpandEvent={(_, index, active) => onExpandTalentEvent(groupIndex, index, active)}
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
        onPerformEvent={() => {}}
        onExpandEvent={(_, index, active) => onExpandTalentEvent(configGroups.length, index, active)}
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
        activeMember={activeMember}
        toolbox={toolbox}
        configGroups={getAttackEventConfigGroups(activeMember.appChar)}
      />
    </div>
  );
}
