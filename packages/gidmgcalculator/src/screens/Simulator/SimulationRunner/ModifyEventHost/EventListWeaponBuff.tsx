import { useState } from "react";
import { AppWeapon, WeaponBuff } from "@Backend";
import type { ActiveMember } from "@Simulator/ToolboxProvider";
import type { InputsByMember } from "./ModifyEventHost.types";

import { getWeaponBuffDescription } from "@Src/utils/description-parsers";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";

// Component
import { GenshinModifierView } from "@Src/components";
import { ActionButton } from "../components";

interface EventListWeaponBuffProps {
  member: ActiveMember;
  initalInputsByMember?: InputsByMember;
  weaponData: AppWeapon;
  refi: number;
}
export function EventListWeaponBuff({ member, initalInputsByMember = {}, weaponData, refi }: EventListWeaponBuffProps) {
  const dispatch = useDispatch();
  const [allInputs, setAllInputs] = useState(initalInputsByMember);

  const inputsList = allInputs[member.data.code];

  const onMakeEvent = (mod: WeaponBuff, inputs: number[], alsoSwitch?: boolean) => {
    dispatch(
      addEvent({
        type: "MODIFY",
        performerCode: member.data.code,
        modifier: {
          type: "WEAPON",
          code: weaponData.code,
          id: mod.index,
          inputs,
        },
        duration: 10,
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
      {weaponData.buffs?.map((modifier, modIndex) => {
        const inputs = inputsList[modIndex];
        const inputConfigs = modifier.inputConfigs?.filter((config) => config.for !== "FOR_TEAM");

        return (
          <div key={modifier.index}>
            <GenshinModifierView
              mutable
              heading={weaponData.name}
              headingVariant="custom"
              description={getWeaponBuffDescription(weaponData.descriptions, modifier, refi)}
              checked={false}
              inputs={inputs}
              inputConfigs={inputConfigs}
              onSelectOption={(value, inputIndex) => {
                onChangeInput(modIndex, inputIndex, value);
              }}
            />

            <ActionButton
              ctaText="Trigger"
              className={`pr-1 ${inputConfigs?.length ? "mt-3" : "mt-2"}`}
              onClick={(alsoSwitch) => onMakeEvent(modifier, inputs, alsoSwitch)}
            />
          </div>
        );
      })}
    </div>
  );
}
