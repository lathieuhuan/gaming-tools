import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";
import { getSimulation } from "@Store/simulator-slice";
import { ActiveMemberInfo, ActiveSimulationInfo, ToolsContext } from "./contexts";
import { SimulatorTotalAttributeControl } from "./tools";
import { SimulatorBuffApplier } from "@Backend";

const selectEvents = (state: RootState) => getSimulation(state.simulator)?.events ?? [];

interface ToolboxProps {
  activeMember: ActiveMemberInfo | null;
  activeSimulation: ActiveSimulationInfo | null;
  totalAttrCtrl: SimulatorTotalAttributeControl | null;
  children: React.ReactNode;
}
export function ToolsProvider({ activeMember, activeSimulation, totalAttrCtrl, children }: ToolboxProps) {
  const events = useSelector(selectEvents);

  console.log("render: Toolbox");

  const totalAttr = totalAttrCtrl ? totalAttrCtrl.clone() : null;
  const bonus = [];

  if (activeSimulation && activeMember && totalAttr) {
    const buffApplier = new SimulatorBuffApplier({ ...activeMember, ...activeSimulation }, totalAttr);

    for (const event of events) {
      switch (event.type) {
        case "MODIFY": {
          buffApplier.applyCharacterBuff({
            buff: mod,
            description: "",
            inputs,
            applyAttrBonus: (bonus) => {
              dispatch(
                addBonus({
                  type: "ATTRIBUTE",
                  bonus: {
                    toStat: bonus.stat,
                    value: bonus.value,
                    stable: bonus.stable,
                    trigger: {
                      character: "",
                      src: "",
                    },
                  },
                })
              );
            },
            applyAttkBonus: (bonus) => {
              dispatch(
                addBonus({
                  type: "ATTACK",
                  bonus: {
                    toKey: bonus.path,
                    toType: bonus.module,
                    value: bonus.value,
                    trigger: {
                      character: "",
                      src: "",
                    },
                  },
                })
              );
            },
          });
          break;
        }
      }
    }
  }

  return <ToolsContext.Provider value={totalAttr}>{children}</ToolsContext.Provider>;
}
