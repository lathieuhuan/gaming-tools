import type { MemberOperations } from "../../models/Team";

import { triggerAbilityBuffEvent, updateAbilityInputs } from "../../actions/build";
import { selectModInputs, useSimulatorStore } from "../../store";

import { BuffEventItem } from "./BuffEventItem";

type AbilityEventListProps = {
  memberOps: MemberOperations;
};

export function AbilityEventList({ memberOps }: AbilityEventListProps) {
  const inputsById = useSimulatorStore(selectModInputs("ABILITY_BUFF"));

  const { data } = memberOps.member;

  const handleInputChange = (modId: number, inputIndex: number, value: number) => {
    updateAbilityInputs("ABILITY_BUFF", modId, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (modId: number, inputs: number[]) => {
    triggerAbilityBuffEvent({
      performer: data.code,
      modId,
      inputs,
    });
  };

  return (
    <div className="space-y-2">
      {data.buffs?.map((buff) => {
        if (!memberOps.can.performEffect(buff)) {
          return null;
        }

        const inputs = inputsById[buff.id] || [];

        return (
          <BuffEventItem
            key={buff.id}
            heading={buff.src}
            description={memberOps.show.abilityBuffText(buff, inputs)}
            inputs={inputs}
            inputConfigs={buff.inputConfigs}
            onInputChange={(inputIndex, value) => handleInputChange(buff.id, inputIndex, value)}
            onTrigger={() => handleTrigger(buff.id, inputs)}
          />
        );
      })}
    </div>
  );
}
