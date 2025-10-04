import clsx, { type ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { InputNumber } from "../InputNumber";
import { Checkbox } from "../Checkbox";
import { Select } from "../Select";

type SelectOption = {
  label: string | number;
  value: number;
};

type ModifierViewInputTextConfig = {
  label: string;
  type: "text";
  max?: number;
};

type ModifierViewInputCheckConfig = {
  label: string;
  type: "check";
};

type ModifierViewInputSelectConfig = {
  label: string;
  type: "select";
  options: SelectOption[];
  style?: React.CSSProperties;
};

export type ModifierViewInputConfig =
  | ModifierViewInputTextConfig
  | ModifierViewInputCheckConfig
  | ModifierViewInputSelectConfig;

export type ModifierViewProps = {
  className?: ClassValue;
  mutable?: boolean;
  /** Default to 'toggle' if mutable is true, to 'view' if mutable is false */
  headingVariant?: "toggle" | "view" | "custom";
  headingSuffix?: React.ReactNode;
  checked?: boolean;
  heading: React.ReactNode;
  description: React.ReactNode;
  inputConfigs?: ModifierViewInputConfig[];
  inputs?: number[];
  onToggle?: () => void;
  onChangeText?: (newValue: number, inputIndex: number) => void;
  onToggleCheck?: (currentInput: number, inputIndex: number) => void;
  onSelectOption?: (value: number, inputIndex: number) => void;
};

export const ModifierView = ({
  className,
  mutable,
  headingVariant = mutable ? "toggle" : "view",
  headingSuffix,
  checked,
  heading,
  description,
  inputConfigs = [],
  inputs = [],
  onToggle,
  onChangeText,
  onToggleCheck,
  onSelectOption,
}: ModifierViewProps) => {
  //
  const renderInput = (index: number) => {
    const config = inputConfigs[index];
    const input = inputs[index];

    switch (config.type) {
      case "text":
        if (!mutable) {
          return <p className="text-secondary-1 font-bold capitalize">{input}</p>;
        }
        return (
          <InputNumber
            className="w-20 px-2 py-1.5 text-right font-semibold"
            value={input}
            max={config.max}
            onChange={(value) => onChangeText?.(value, index)}
          />
        );
      case "check":
        return (
          <Checkbox
            size={mutable ? "medium" : "small"}
            checked={input === 1}
            disabled={!mutable}
            onChange={() => onToggleCheck?.(input, index)}
          />
        );
      case "select":
        if (!config.options) return null;

        if (!mutable) {
          const { label } = config.options.find((option) => option.value === input) || {};
          return label ? <p className="text-secondary-1 font-bold capitalize">{label}</p> : null;
        }
        return (
          <Select
            className="max-w-32 h-8 font-semibold"
            style={config.style}
            value={input}
            options={config.options}
            onChange={(value) => onSelectOption?.(+value, index)}
          />
        );
      default:
        return null;
    }
  };

  let headingNode: React.ReactNode = null;

  switch (headingVariant) {
    case "view":
      headingNode = <span>+ {heading}</span>;
      break;
    case "toggle":
      headingNode = (
        <Checkbox checked={checked} onChange={onToggle}>
          {heading}
        </Checkbox>
      );
      break;
    case "custom":
      headingNode = <span>{heading}</span>;
      break;
  }

  return (
    <div className={cn("text-white", className)}>
      <div className="mb-1 flex justify-between items-start gap-2 font-semibold text-primary-1">
        {headingNode}
        {headingSuffix}
      </div>
      {typeof description === "string" ? (
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <div className="text-sm">{description}</div>
      )}

      {inputConfigs.length ? (
        <div className={clsx("flex flex-col", mutable ? "mt-2 pr-1 pb-1 gap-3" : "mt-1 gap-2")}>
          {inputConfigs.map((config, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-center justify-end gap-4",
                mutable ? "min-h-9" : "min-h-6"
              )}
              aria-label={config.label}
            >
              <span className="text-base text-right">{config.label}</span>

              {renderInput(i)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
