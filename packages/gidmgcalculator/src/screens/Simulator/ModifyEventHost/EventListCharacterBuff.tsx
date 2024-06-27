import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Button } from "rond";
import { CharacterBuff } from "@Backend";

import { ActiveMember, ActiveSimulation } from "@Simulator/ToolboxProvider";
import { parseAbilityDescription } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { addEvent, selectOnFieldMember } from "@Store/simulator-slice";
import { InputsByMember } from "./ModifyEventHost.types";

import { GenshinModifierView } from "@Src/components";

interface EventListCharacterBuffProps {
  simulation: ActiveSimulation;
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

  const isOnField = useSelector(selectOnFieldMember) === member.data.code;

  const inputsList = allInputs[member.data.code];

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
                onChangeInput(modIndex, inputIndex, value);
              }}
            />

            <div className={"pr-1 flex justify-end " + (inputConfigs?.length ? "mt-3" : "mt-2")}>
              <Button
                shape="square"
                size="small"
                className={isOnField ? "" : "rounded-r-none"}
                onClick={() => onMakeEvent(modifier, inputs)}
              >
                Trigger
              </Button>

              {!isOnField && (
                <Button
                  shape="square"
                  size="small"
                  className="ml-0.5 rounded-l-none"
                  icon={<FaSyncAlt />}
                  onClick={() => onMakeEvent(modifier, inputs, true)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
