import { Fragment, useState } from "react";
import { CharacterBuff } from "@Backend";

import { parseAbilityDescription } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { addBonus, addEvent } from "@Store/simulator-slice";
import {
  ActiveMemberInfo,
  ActiveSimulationInfo,
  useActiveMember,
  useActiveSimulation,
} from "@Simulator/SimulatorProviders";

import { GenshinModifierView } from "@Src/components";
import { Button } from "rond";

type Ctrl = {
  index: number;
  inputs: number[];
};

interface CoreProps {
  member: ActiveMemberInfo;
  simulation: ActiveSimulationInfo;
  initialCtrls?: Ctrl[];
  buffs?: CharacterBuff[];
}

function Core({ member, initialCtrls = [], simulation, buffs = [] }: CoreProps) {
  const dispatch = useDispatch();

  const [ctrls, setCtrls] = useState(initialCtrls);

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
  console.log(ctrls);

  return (
    <div>
      {buffs.map((modifier) => {
        const ctrlIndex = ctrls.findIndex((ctrl) => ctrl.index === modifier.index);
        const inputs = ctrls[ctrlIndex]?.inputs || [];

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
                setCtrls((prevCtrls) => {
                  const newCtrls = [...prevCtrls];
                  const ctrl = newCtrls[ctrlIndex];
                  if (ctrl) ctrl.inputs[inputIndex] = value;
                  return newCtrls;
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

export function ModifyEventsMaker() {
  const simulation = useActiveSimulation();
  const member = useActiveMember();

  if (!simulation || !member) {
    return null;
  }
  const initialCtrls: Ctrl[] | undefined = member.appChar.buffs?.map((buff) => {
    return {
      index: buff.index,
      inputs: [],
    };
  });

  return <Core {...{ simulation, member, initialCtrls }} buffs={member.appChar.buffs} />;
}
