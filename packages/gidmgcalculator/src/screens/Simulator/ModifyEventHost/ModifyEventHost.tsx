import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Button } from "rond";
import { CharacterBuff, EntityCalc } from "@Backend";

import { Modifier_, parseAbilityDescription } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";
import { ActiveMember, ActiveSimulation, useActiveMember, useActiveSimulation } from "@Simulator/ToolboxProvider";

import { GenshinModifierView } from "@Src/components";

interface ModifyEventHostProps {
  member: ActiveMember;
  simulation: ActiveSimulation;
  initalInputsList?: number[][];
  buffs?: CharacterBuff[];
}

function ModifyEventHostCore({ member, initalInputsList = [], simulation, buffs = [] }: ModifyEventHostProps) {
  const dispatch = useDispatch();
  const [inputsList, setInputsList] = useState(initalInputsList);

  const onMakeEvent = (mod: CharacterBuff, inputs: number[], alsoSwitch?: boolean) => {
    const performerCode = member.data.code;

    dispatch(
      addEvent({
        type: "MODIFY",
        performer: {
          type: "CHARACTER",
          code: performerCode,
        },
        modifier: {
          id: mod.index,
          inputs,
        },
        alsoSwitch: alsoSwitch && performerCode !== simulation.getLastestChunk().ownerCode ? true : undefined,
      })
    );
  };

  return (
    <div className="h-full hide-scrollbar space-y-3">
      {buffs.map((modifier, modIndex) => {
        const inputs = inputsList[modIndex];
        const inputConfigs = modifier.inputConfigs?.filter((config) => config.for !== "FOR_TEAM");

        return (
          <div key={modifier.index}>
            <GenshinModifierView
              mutable={true}
              heading={modifier.src}
              headingVariant="CUSTOM"
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
              inputConfigs={inputConfigs}
              onSelectOption={(value, inputIndex) => {
                setInputsList((prevList) => {
                  const newList = [...prevList];
                  newList[modIndex][inputIndex] = value;
                  return newList;
                });
              }}
            />

            <div className={"pr-1 flex justify-end " + (inputConfigs?.length ? "mt-3" : "mt-2")}>
              <Button
                shape="square"
                size="small"
                className="rounded-r-none"
                onClick={() => onMakeEvent(modifier, inputs)}
              >
                Trigger
              </Button>

              <Button
                shape="square"
                size="small"
                className="ml-0.5 rounded-l-none"
                icon={<FaSyncAlt />}
                onClick={() => onMakeEvent(modifier, inputs, true)}
              />
            </div>
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
