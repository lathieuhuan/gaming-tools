import type { MemberOperations } from "../../models/Team";

import { triggerWeaponBuffEvent, updateAbilityInputs } from "../../actions/build";
import { selectMemberInputs, useSimulatorStore } from "../../store";

import { EventTrigger } from "../components/EventTrigger";

type WeaponBuffListProps = {
  memberOps: MemberOperations;
};

export function WeaponBuffList({ memberOps }: WeaponBuffListProps) {
  const inputsById = useSimulatorStore(selectMemberInputs("WEAPON_BUFF"));

  const { data, refi } = memberOps.member.weapon;

  const handleInputChange = (modId: number, inputIndex: number, value: number) => {
    updateAbilityInputs("WEAPON_BUFF", modId, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (modId: number, inputs: number[]) => {
    triggerWeaponBuffEvent({
      performer: memberOps.member.code,
      modId,
      inputs,
    });
  };

  return (
    <div className="space-y-2">
      {data.buffs?.map((buff) => {
        const inputs = inputsById[buff.id] || [];
        const inputConfigs = buff.inputConfigs?.filter(
          (config) => !config.for || config.for !== "FOR_TEAM"
        );

        return (
          <EventTrigger
            key={buff.id}
            heading={`${data.name} R${refi}`}
            description={memberOps.show.weaponBuffText(buff)}
            inputs={inputs}
            inputConfigs={inputConfigs}
            onInputChange={(inputIndex, value) => handleInputChange(buff.id, inputIndex, value)}
            onTrigger={() => handleTrigger(buff.id, inputs)}
          />
        );
      })}
    </div>
  );
}
