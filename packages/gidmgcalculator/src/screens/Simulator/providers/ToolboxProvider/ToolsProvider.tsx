import { AppCharacter, SimulatorBuffApplier } from "@Backend";

import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";
import { getSimulation } from "@Store/simulator-slice";
import { ActiveMemberInfo, ActiveSimulationInfo, ToolsContext } from "./contexts";
import { SimulationAttackBonus, SimulationAttributeBonus, SimulatorTotalAttributeControl } from "./tools";

const selectEvents = (state: RootState) => getSimulation(state.simulator)?.events ?? [];

export type AppParty = Record<string, AppCharacter>;

interface ToolboxProps {
  data: {
    activeMember: ActiveMemberInfo;
    activeSimulation: ActiveSimulationInfo;
    appParty: AppParty;
  } | null;
  totalAttrCtrl?: SimulatorTotalAttributeControl;
  children: React.ReactNode;
}
export function ToolsProvider({ data, totalAttrCtrl, children }: ToolboxProps) {
  const events = useSelector(selectEvents);

  console.log("render: Toolbox");

  const totalAttr = totalAttrCtrl ? totalAttrCtrl.clone() : null;
  const attrBonus: SimulationAttributeBonus[] = [];
  const attkBonus: SimulationAttackBonus[] = [];

  if (data && totalAttr) {
    const { activeMember, activeSimulation, appParty } = data;

    const buffApplier = new SimulatorBuffApplier({ ...activeMember, ...activeSimulation }, totalAttr);

    for (const event of events) {
      switch (event.type) {
        case "MODIFY": {
          const appCharacter = appParty[event.performer];
          const buff = appCharacter?.buffs?.find((buff) => buff.index === event.modifier.id);
          if (!buff) continue;

          const trigger = {
            character: appCharacter.name,
            modifier: buff.src,
          };

          buffApplier.applyCharacterBuff({
            buff,
            description: "",
            inputs: event.modifier.inputs,
            applyAttrBonus: (bonus) => {
              const add = bonus.stable ? totalAttr.addStable : totalAttr.addUnstable;

              attrBonus.push({
                stable: bonus.stable,
                toStat: bonus.stat,
                value: bonus.value,
                trigger,
              });
              add(bonus.stat, bonus.value, bonus.description);
            },
            applyAttkBonus: (bonus) => {
              attkBonus.push({
                toType: bonus.module,
                toKey: bonus.path,
                value: bonus.value,
                trigger,
              });
            },
          });
          break;
        }
        case "HIT": {
          //
          break;
        }
      }
    }
  }

  return <ToolsContext.Provider value={totalAttr}>{children}</ToolsContext.Provider>;
}
