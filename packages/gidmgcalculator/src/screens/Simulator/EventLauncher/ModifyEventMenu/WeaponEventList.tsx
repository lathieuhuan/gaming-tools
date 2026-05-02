import type { WeaponBuff } from "@/types";
import type { MemberOperations } from "../../models/Team";

import { triggerWeaponBuffEvent, updateAbilityInputs } from "../../actions/build";
import { selectModInputs, useSimulatorStore } from "../../store";

import { BuffEventItem } from "./BuffEventItem";

type WeaponEventListProps = {
  memberOps: MemberOperations;
};

export function WeaponEventList({ memberOps }: WeaponEventListProps) {
  const inputsById = useSimulatorStore(selectModInputs("WEAPON_BUFF"));

  const { data, refi } = memberOps.member.weapon;

  const handleInputChange = (modId: number, inputIndex: number, value: number) => {
    updateAbilityInputs("WEAPON_BUFF", modId, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (buff: WeaponBuff, inputs: number[]) => {
    triggerWeaponBuffEvent({
      performer: memberOps.member.code,
      modId: buff.id,
      inputs,
    });
  };

  return (
    <div className="space-y-2">
      {data.buffs?.map((buff) => {
        const inputs = inputsById[buff.id] || [];

        return (
          <BuffEventItem
            key={buff.id}
            heading={`${data.name} R${refi}`}
            description={memberOps.show.weaponBuffText(buff)}
            inputs={inputs}
            inputConfigs={buff.inputConfigs}
            onInputChange={(inputIndex, value) => handleInputChange(buff.id, inputIndex, value)}
            onTrigger={() => handleTrigger(buff, inputs)}
          />
        );
      })}
    </div>
  );
}
