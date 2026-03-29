import { Button } from "rond";

import type { CharacterBuff } from "@/types";

import { GenshinModifierView } from "@/components";
import { triggerAbilityBuffEvent, updateAbilityInputs } from "../../actions/build";
import { selectActiveMember, selectModInputs, useSimulatorStore } from "../../store";

export function AbilityEventList() {
  const activeMember = useSimulatorStore(selectActiveMember);
  const inputsById = useSimulatorStore(selectModInputs("ABILITY_BUFF"));
  const { buffs } = activeMember.data;

  const handleInputChange = (modId: number, inputIndex: number, value: number) => {
    updateAbilityInputs("ABILITY_BUFF", modId, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (buff: CharacterBuff) => {
    triggerAbilityBuffEvent({
      performer: activeMember.data.code,
      modId: buff.index,
    });
  };

  return (
    <div>
      <div className="space-y-2">
        {buffs?.map((buff, index) => {
          const inputConfigs = buff.inputConfigs;
          const inputs = inputsById[buff.index] || [];

          return (
            <div key={index} className="p-2 bg-dark-2 rounded-xs">
              <GenshinModifierView
                mutable
                headingVariant="view"
                heading={buff.src}
                description={activeMember.parseBuffDesc(buff, inputs)}
                inputs={inputs}
                inputConfigs={inputConfigs}
                onToggleCheck={(current, inputIndex) => {
                  handleInputChange(buff.index, inputIndex, current === 1 ? 0 : 1);
                }}
                onSelectOption={(value, inputIndex) => {
                  handleInputChange(buff.index, inputIndex, value);
                }}
                onChangeText={(value, inputIndex) => {
                  handleInputChange(buff.index, inputIndex, value);
                }}
              />
              <div className="mt-2 flex">
                <Button
                  size="small"
                  variant="primary"
                  className="ml-auto"
                  onClick={() => handleTrigger(buff)}
                >
                  Trigger
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
