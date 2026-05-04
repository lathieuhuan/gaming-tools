import { Button } from "rond";

import type { ModInputSpec } from "@/types";

import { GenshinModifierView } from "@/components";

type EventTriggerProps = {
  heading: string;
  description?: string;
  inputs: number[];
  inputConfigs?: ModInputSpec[];
  onInputChange: (inputIndex: number, value: number) => void;
  onTrigger: () => void;
};

export function EventTrigger({
  heading,
  description,
  inputs,
  inputConfigs,
  onInputChange,
  onTrigger,
}: EventTriggerProps) {
  return (
    <div className="p-2 bg-dark-2 rounded-xs">
      <GenshinModifierView
        mutable
        headingVariant="view"
        heading={heading}
        description={description}
        inputs={inputs}
        inputConfigs={inputConfigs}
        onToggleCheck={(current, inputIndex) => {
          onInputChange(inputIndex, current === 1 ? 0 : 1);
        }}
        onSelectOption={(value, inputIndex) => {
          onInputChange(inputIndex, value);
        }}
        onChangeText={(value, inputIndex) => {
          onInputChange(inputIndex, value);
        }}
      />
      <div className="mt-2 flex">
        <Button size="small" variant="primary" className="ml-auto" onClick={onTrigger}>
          Trigger
        </Button>
      </div>
    </div>
  );
}
