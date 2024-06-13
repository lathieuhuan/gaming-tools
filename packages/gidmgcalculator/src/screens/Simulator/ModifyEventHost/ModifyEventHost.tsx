import { useState } from "react";
import { Button } from "rond";
import { CharacterBuff, EntityCalc } from "@Backend";

import { Modifier_, parseAbilityDescription } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";
import {
  ActiveMemberInfo,
  ActiveSimulationInfo,
  useActiveMember,
  useActiveSimulation,
} from "@Simulator/ToolboxProvider";

import { GenshinModifierView } from "@Src/components";

interface ModifyEventHostProps {
  member: ActiveMemberInfo;
  simulation: ActiveSimulationInfo;
  initalInputsList?: number[][];
  buffs?: CharacterBuff[];
}

function ModifyEventHostCore({ member, initalInputsList = [], simulation, buffs = [] }: ModifyEventHostProps) {
  const dispatch = useDispatch();
  const [inputsList, setInputsList] = useState(initalInputsList);

  const onMakeEvent = (mod: CharacterBuff, inputs: number[]) => {
    dispatch(
      addEvent({
        type: "MODIFY",
        performer: member.data.code,
        modifier: {
          id: mod.index,
          inputs,
        },
        receiver: member.data.code,
      })
    );
  };

  return (
    <div className="h-full hide-scrollbar space-y-2">
      {buffs.map((modifier, modIndex) => {
        const inputs = inputsList[modIndex];

        return (
          <div key={modifier.index} className="p-3 rounded bg-surface-1">
            <GenshinModifierView
              mutable={true}
              heading={modifier.src}
              description={parseAbilityDescription(
                modifier,
                {
                  char: member.info,
                  appChar: member.data,
                  partyData: simulation.partyData,
                },
                inputs,
                true
              )}
              checked={false}
              inputs={inputs}
              inputConfigs={modifier.inputConfigs?.filter((config) => config.for !== "FOR_TEAM")}
              onSelectOption={(value, inputIndex) => {
                setInputsList((prevList) => {
                  const newList = [...prevList];
                  newList[modIndex][inputIndex] = value;
                  return newList;
                });
              }}
            />
            <Button shape="square" size="small" className="mt-3 mx-auto" onClick={() => onMakeEvent(modifier, inputs)}>
              Trigger
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function ModifyEventHost(props: { className?: string }) {
  const simulation = useActiveSimulation();
  const member = useActiveMember();

  if (!simulation || !member) {
    return null;
  }

  const buffs = member.data.buffs?.filter((buff) => EntityCalc.isGrantedEffect(buff, member.info));

  const initalInputsList = buffs?.map((buff) => Modifier_.createModCtrl(buff, true).inputs ?? []);

  return (
    <div className={props.className}>
      <ModifyEventHostCore {...{ simulation, member, initalInputsList, buffs }} />
    </div>
  );
}
