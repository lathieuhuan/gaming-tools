import { Button } from "rond";

import type { WeaponBuff } from "@/types";
import type { MemberOperations } from "../../models/Team";

import { triggerWeaponBuffEvent, updateAbilityInputs } from "../../actions/build";
import { selectModInputs, useSimulatorStore } from "../../store";

import { GenshinModifierView } from "@/components";

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
        const inputConfigs = buff.inputConfigs;
        const inputs = inputsById[buff.id] || [];

        const description = memberOps.show.weaponBuffText(buff);

        return (
          <div key={buff.id} className="p-2 bg-dark-2 rounded-xs">
            <GenshinModifierView
              mutable
              headingVariant="view"
              heading={`${data.name} R${refi}`}
              description={description}
              inputs={inputs}
              inputConfigs={inputConfigs}
              onToggleCheck={(current, inputIndex) => {
                handleInputChange(buff.id, inputIndex, current === 1 ? 0 : 1);
              }}
              onSelectOption={(value, inputIndex) => {
                handleInputChange(buff.id, inputIndex, value);
              }}
              onChangeText={(value, inputIndex) => {
                handleInputChange(buff.id, inputIndex, value);
              }}
            />
            <div className="mt-2 flex">
              <Button
                size="small"
                variant="primary"
                className="ml-auto"
                onClick={() => handleTrigger(buff, inputs)}
              >
                Trigger
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
