import { clsx, Checkbox, InputNumber } from "rond";
import type { ModInputConfig } from "@Src/types";

export type ModSelectOption = {
  label: string | number;
  value: string | number;
};

const ANEMOABLE_OPTIONS: ModSelectOption[] = [
  { label: "Pyro", value: 0 },
  { label: "Hydro", value: 1 },
  { label: "Electro", value: 2 },
  { label: "Cryo", value: 3 },
];

const DENDROABLE_OPTIONS: ModSelectOption[] = [
  { label: "Pyro", value: 0 },
  { label: "Hydro", value: 1 },
  { label: "Electro", value: 2 },
];

const genNumberSequenceOptions = (max: number | undefined = 0, startsAt0: boolean = false, min: number = 1) => {
  const result = [...Array(max)].map((_, i) => {
    const value = i + min;
    return { label: value, value };
  });
  return startsAt0 ? [{ label: 0, value: 0 }].concat(result) : result;
};

export interface ModifierTemplateProps {
  mutable?: boolean;
  checked?: boolean;
  heading: React.ReactNode;
  description: React.ReactNode;
  inputConfigs?: ModInputConfig[];
  inputs?: number[];
  onToggle?: () => void;
  onChangeText?: (newValue: number, inputIndex: number) => void;
  onToggleCheck?: (currentInput: number, inputIndex: number) => void;
  onSelectOption?: (value: number, inputIndex: number) => void;
}
export function ModifierTemplate({
  mutable = true,
  checked,
  heading,
  description,
  inputConfigs = [],
  inputs = [],
  onToggle,
  onChangeText,
  onToggleCheck,
  onSelectOption,
}: ModifierTemplateProps) {
  //
  const renderInput = (index: number) => {
    const config = inputConfigs[index];
    const input = inputs[index];

    switch (config.type) {
      case "text":
      case "level":
        if (mutable) {
          return (
            <InputNumber
              className="w-20 p-2 text-right font-semibold"
              value={input}
              max={config.type === "level" ? 13 : config.max}
              onChange={(value) => onChangeText?.(value, index)}
            />
          );
        }
        return <p className="text-orange-500 capitalize">{input}</p>;
      case "check":
        return <Checkbox checked={input === 1} readOnly={!mutable} onChange={() => onToggleCheck?.(input, index)} />;
      default: {
        let options: ModSelectOption[] = [];

        switch (config.type) {
          case "select":
          case "stacks":
            if (config.options) {
              options = config.options.map((option, optionIndex) => {
                return {
                  label: option,
                  value: optionIndex,
                };
              });
            } else {
              options = genNumberSequenceOptions(config.max, config.initialValue === 0);
            }
            break;
          case "anemoable":
            options = ANEMOABLE_OPTIONS;
            break;
          case "dendroable":
            options = DENDROABLE_OPTIONS;
            break;
        }

        if (mutable) {
          return (
            <select className="styled-select" value={input} onChange={(e) => onSelectOption?.(+e.target.value, index)}>
              {options.map((opt, i) => (
                <option key={i} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }
        let { label } = options.find((option) => option.value === input) || {};

        return <p className="text-orange-500 capitalize">{label}</p>;
      }
    }
  };

  return (
    <div>
      <div className="mb-1 flex">
        <label className="flex items-center">
          {mutable && <Checkbox className="mr-2" checked={checked} onChange={onToggle} />}
          <span className="font-semibold text-yellow-400">
            {mutable ? "" : "+"} {heading}
          </span>
        </label>
      </div>
      {typeof description === "string" ? (
        <p className="text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <p className="text-sm">{description}</p>
      )}

      {inputConfigs.length ? (
        <div className={clsx("flex flex-col", mutable ? "pt-2 pb-1 pr-1 space-y-3" : "mt-1 space-y-2")}>
          {inputConfigs.map((config, i) => (
            <div key={i} className="flex items-center justify-end" style={{ minHeight: "2.25rem" }}>
              <span className="mr-4 text-base leading-6 text-right">{config.label || "Stacks"}</span>

              {renderInput(i)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
