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

  const onMakeEvent = (mod: CharacterBuff, inputs: number[]) => {
    dispatch(
      addEvent({
        type: "MODIFY",
        performer: {
          type: "CHARACTER",
          code: member.data.code,
        },
        modifier: {
          id: mod.index,
          inputs: [...inputs],
        },
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
              <Button shape="square" size="small" onClick={() => onMakeEvent(modifier, inputs)}>
                Trigger
              </Button>

              <div className="ml-4 flex rounded overflow-hidden bg-[var(--ron-color-light-surface-4)] text-[var(--ron-color-on-light)]">
                <button className="px-2 py-0.5 glow-on-hover">Trigger</button>
                <button className="px-1.5 p-0.5 glow-on-hover border-l border-surface-1">
                  <FaSyncAlt />
                </button>
              </div>
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
