import { useState } from "react";
import {
  AttackBonusControl,
  AttackPattern,
  CalcItem,
  CharacterCalc,
  TRANSFORMATIVE_REACTIONS,
  TalentType,
  configTalentEvent,
} from "@Backend";
import type { ElementModCtrl } from "@Src/types";
import type { RootState } from "@Store/store";

import {
  ActiveMemberInfo,
  ActiveSimulationInfo,
  SimulatorToolbox,
  useActiveMember,
  useActiveSimulation,
  useToolbox,
} from "@Simulator/providers";
import { useTranslation } from "@Src/hooks";
import { useSelector } from "@Store/hooks";
import { getActiveMember } from "@Simulator/Simulator.utils";
import { getTalentAttackEventConfig, type TalentAttackEventConfig } from "./AttackEventHost.utils";

// Components
import { TalentAttackEvent } from "./TalentAttackEvent";
import { AttackEventCoordinator, AttackEventDisplayer } from "./AttackEventCoordinator";
import { AttackPatternConf } from "@Src/backend/calculation";

const selectAttackBonus = (state: RootState) => getActiveMember(state)?.attackBonus ?? [];

interface AttackEventHostProps {
  activeSimulation: ActiveSimulationInfo;
  activeMember: ActiveMemberInfo;
  toolbox: SimulatorToolbox;
  configs: TalentAttackEventConfig[];
}

function AttackEventHostCore({ activeSimulation, activeMember, toolbox, configs }: AttackEventHostProps) {
  const { t } = useTranslation();
  const attackBonus = useSelector(selectAttackBonus);

  console.log("render: AttackEventHostCore");

  const defaultElmtModCtrls: Pick<ElementModCtrl, "absorption" | "reaction" | "infuse_reaction"> = {
    absorption: null,
    reaction: null,
    infuse_reaction: null,
  };

  const configAttPatt = (talentType: TalentType, patternKey: AttackPattern) => {
    const attBonus = new AttackBonusControl();

    for (const bonus of attackBonus) {
      attBonus.add(bonus.toType, bonus.toKey, bonus.value, "");
    }

    const info = {
      char: activeMember.char,
      appChar: activeMember.appChar,
      partyData: activeSimulation.partyData,
    };
    const totalAttr = toolbox.totalAttr.finalize();

    const { disabled, configCalcItem } = AttackPatternConf({
      ...info,
      totalAttr,
      attBonus,
      selfBuffCtrls: [],
      customInfusion: {
        element: "phys",
      },
    })(patternKey);

    const level = CharacterCalc.getFinalTalentLv({ ...info, talentType });

    const configTalent = (item: CalcItem, elmtModCtrls?: Partial<ElementModCtrl>) => {
      return configTalentEvent({
        itemConfig: configCalcItem(item, {
          ...defaultElmtModCtrls,
          ...elmtModCtrls,
        }),
        level,
        totalAttr,
        attBonus,
        info,
        target: activeSimulation.target,
      });
    };
    return {
      disabled,
      configTalent,
    };
  };

  return (
    <AttackEventCoordinator>
      <div className="h-full hide-scrollbar space-y-3">
        {configs.map((config) => {
          if (config.groups.every((group) => !group.items.length)) {
            return null;
          }

          return (
            <div key={config.title}>
              <p className="text-sm text-light-default/60">{t(config.title)}</p>

              <div className="mt-1 space-y-2">
                {config.groups.map((group) => {
                  const { disabled, configTalent } = configAttPatt(config.title, group.type);

                  return group.items.map((item) => {
                    const id = `${group.type}.${item.name}`;

                    return (
                      <AttackEventDisplayer
                        key={id}
                        id={id}
                        label={item.name}
                        disabled={disabled}
                        onQuickHit={() => {}}
                      >
                        <TalentAttackEvent item={item} configTalentEvent={configTalent} />
                      </AttackEventDisplayer>
                    );
                  });
                })}
              </div>
            </div>
          );
        })}
        {/* <AttackEventGroup
        name={t("RXN_CALC")}
        items={[...TRANSFORMATIVE_REACTIONS]}
        getItemState={(item, itemIndex) => ({
          label: t(item),
          isActive: configGroups.length === active.groupI && itemIndex === active.itemI,
        })}
        renderContent={() => <p>Hello</p>}
        onPerformEvent={() => {}}
        onExpandEvent={(_, index, active) => onExpandTalentEvent(configGroups.length, index, active)}
      /> */}
      </div>
    </AttackEventCoordinator>
  );
}

export function AttackEventHost({ className = "" }: { className?: string }) {
  const activeSimulation = useActiveSimulation();
  const activeMember = useActiveMember();
  const toolbox = useToolbox();

  console.log("render: AttackEventHost");

  if (!activeSimulation || !activeMember || !toolbox) {
    return null;
  }

  return (
    <div className={"p-4 h-full rounded-md bg-surface-1 " + className}>
      <AttackEventHostCore
        activeSimulation={activeSimulation}
        activeMember={activeMember}
        toolbox={toolbox}
        configs={getTalentAttackEventConfig(activeMember.appChar)}
      />
    </div>
  );
}
