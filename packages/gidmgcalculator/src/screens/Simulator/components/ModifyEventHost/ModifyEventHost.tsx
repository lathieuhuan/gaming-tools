import { Fragment, useState } from "react";
import { Button } from "rond";
import { CharacterBuff, EntityCalc } from "@Backend";

import { Modifier_, parseAbilityDescription, toArray } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { addBonus, addEvent } from "@Store/simulator-slice";
import {
  ActiveMemberInfo,
  ActiveSimulationInfo,
  useActiveMember,
  useActiveSimulation,
  useToolbox,
} from "@Simulator/providers";

import { GenshinModifierView } from "@Src/components";

interface ModifyEventHostProps {
  member: ActiveMemberInfo;
  simulation: ActiveSimulationInfo;
  initalInputsList?: number[][];
  buffs?: CharacterBuff[];
}

function ModifyEventHostCore({ member, initalInputsList = [], simulation, buffs = [] }: ModifyEventHostProps) {
  const dispatch = useDispatch();
  const toolbox = useToolbox();

  const [inputsList, setInputsList] = useState(initalInputsList);

  if (!toolbox) {
    return null;
  }

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

    // const attributeBonus: SimulationAttributeBonus[] = [];

    toolbox.buffApplier.applyCharacterBuff({
      buff: mod,
      description: "",
      inputs,
      applyAttrBonus: (bonus) => {
        // for (const toStat of toArray(bonus.keys)) {
        //   attributeBonus.push({
        //     stable: bonus.stable,
        //     toStat,
        //     value: bonus.value,
        //     trigger: {
        //       character: "",
        //       src: "",
        //     },
        //   });
        // }

        for (const toStat of toArray(bonus.keys)) {
          dispatch(
            addBonus({
              type: "ATTRIBUTE",
              bonus: {
                stable: bonus.stable,
                toStat,
                value: bonus.value,
                trigger: {
                  character: "",
                  src: "",
                },
              },
            })
          );
        }
      },
      applyAttkBonus: () => {},
    });
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

  const initalInputsList = buffs?.map((buff) => Modifier_.createModCtrl(buff, true).inputs ?? []);

  return <ModifyEventHostCore {...{ simulation, member, initalInputsList, buffs }} />;
}
