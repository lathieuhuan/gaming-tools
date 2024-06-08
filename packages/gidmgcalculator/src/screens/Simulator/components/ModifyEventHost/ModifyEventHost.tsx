import { Fragment, useState } from "react";
import { Button } from "rond";
import { CharacterBuff, EntityCalc } from "@Backend";

import { Modifier_, parseAbilityDescription } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { addBonus, addEvent } from "@Store/simulator-slice";
import { ActiveMemberInfo, ActiveSimulationInfo, useActiveMember, useActiveSimulation } from "@Simulator/providers";

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
        event: {
          character: member.char.name,
          modId: mod.index,
          modInputs: inputs,
        },
      })
    );

    // make bonus from event

    dispatch(
      addBonus({
        type: "ATTRIBUTE",
        bonus: {
          toStat: "em",
          stable: true,
          value: 100,
          trigger: {
            character: "Albedo",
            src: "Constellation 1",
          },
        },
      })
    );
  };

  console.log("ctrls");
  console.log(inputsList);

  return (
    <div>
      {buffs.map((modifier, modIndex) => {
        const inputs = inputsList[modIndex];

        return (
          <Fragment key={modifier.index}>
            <GenshinModifierView
              mutable={true}
              heading={modifier.src}
              description={parseAbilityDescription(
                modifier,
                {
                  char: member.char,
                  appChar: member.appChar,
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
            <Button onClick={() => onMakeEvent(modifier, inputs)}>Trigger</Button>
          </Fragment>
        );
      })}
    </div>
  );
}

export function ModifyEventHost() {
  const simulation = useActiveSimulation();
  const member = useActiveMember();

  if (!simulation || !member) {
    return null;
  }

  const buffs = member.appChar.buffs?.filter((buff) => EntityCalc.isGrantedEffect(buff, member.char));

  const initialCtrls = buffs?.map((buff) => Modifier_.createModCtrl(buff, true).inputs ?? []);

  return <ModifyEventHostCore {...{ simulation, member, initialCtrls, buffs }} />;
}
