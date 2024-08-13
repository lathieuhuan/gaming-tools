import { useState } from "react";
import { CharacterBuff } from "@Backend";
import type { ActiveMember, SimulationManager } from "@Simulator/ToolboxProvider";
import type { InputsByMember } from "./ModifyEventHost.types";

import { parseAbilityDescription } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";

// Component
import { GenshinModifierView } from "@Src/components";
import { ActionButton } from "../components";

interface EventListCharacterBuffProps {
  simulation: SimulationManager;
  member: ActiveMember;
  initalInputsByMember?: InputsByMember;
  buffs?: CharacterBuff[];
}
export function EventListCharacterBuff({
  simulation,
  member,
  initalInputsByMember = {},
  buffs = [],
}: EventListCharacterBuffProps) {
  const dispatch = useDispatch();
  const [allInputs, setAllInputs] = useState(initalInputsByMember);

  const inputsList = allInputs[member.data.code];

  const onMakeEvent = (mod: CharacterBuff, inputs: number[], alsoSwitch?: boolean) => {
    const performerCode = member.data.code;

    dispatch(
      addEvent({
        type: "ENTITY_MODIFY",
        performer: {
          type: "CHARACTER",
          code: performerCode,
        },
        modifier: {
          type: "CHARACTER",
          code: performerCode,
          id: mod.index,
          inputs,
        },
        alsoSwitch,
      })
    );
  };

  const onChangeInput = (modIndex: number, inputIndex: number, value: number) => {
    setAllInputs((prevInputsList) => {
      const newInputsList = { ...prevInputsList };
      const mod = prevInputsList[member.data.code][modIndex];

      if (mod) mod[inputIndex] = value;
      return newInputsList;
    });
  };

  return (
    <div className="space-y-3">
      {buffs.map((modifier, modIndex) => {
        const inputs = inputsList[modIndex];
        const inputConfigs = modifier.inputConfigs?.filter((config) => config.for !== "FOR_TEAM");

        return (
          <div key={modifier.index}>
            <GenshinModifierView
              mutable
              heading={modifier.src}
              headingVariant="custom"
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
                onChangeInput(modIndex, inputIndex, value);
              }}
            />

            <ActionButton
              ctaText="Trigger"
              className={"pr-1 justify-end " + (inputConfigs?.length ? "mt-3" : "mt-2")}
              onClick={(alsoSwitch) => onMakeEvent(modifier, inputs, alsoSwitch)}
            />
          </div>
        );
      })}
    </div>
  );
}
