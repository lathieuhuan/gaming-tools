import { Button } from "rond";

import type { CharacterBuff } from "@/types";

import { GenshinModifierView } from "@/components";
import { triggerAbilityBuffEvent, updateAbilityInputs } from "../../actions/build";
import {
  selectActiveMember,
  selectModInputs,
  selectProcessor,
  useSimulatorStore,
} from "../../store";

export function AbilityEventList() {
  const activeMember = useSimulatorStore(selectActiveMember);
  const teamOps = useSimulatorStore((state) => selectProcessor(state).team.ops);
  const inputsById = useSimulatorStore(selectModInputs("ABILITY_BUFF"));

  const { data } = activeMember;
  const memberCan = teamOps.can(data.code);
  const memberShow = teamOps.show(data.code);

  const handleInputChange = (modId: number, inputIndex: number, value: number) => {
    updateAbilityInputs("ABILITY_BUFF", modId, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (buff: CharacterBuff, inputs: number[]) => {
    triggerAbilityBuffEvent({
      performer: data.code,
      modId: buff.index,
      inputs,
    });
  };

  return (
    <div>
      <div className="space-y-2">
        {data.buffs?.map((buff, index) => {
          if (!memberCan.performEffect(buff)) {
            return null;
          }

          const inputConfigs = buff.inputConfigs;
          const inputs = inputsById[buff.index] || [];

          const description = memberShow.buffText(buff, inputs);

          return (
            <div key={index} className="p-2 bg-dark-2 rounded-xs">
              <GenshinModifierView
                mutable
                headingVariant="view"
                heading={buff.src}
                description={description}
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
                  onClick={() => handleTrigger(buff, inputs)}
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
