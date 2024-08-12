import clsx, { ClassValue } from "clsx";
import { InputNumber } from "../InputNumber";
import { Checkbox } from "../Checkbox";
import { Select } from "../Select";
import "./ModifierView.styles.scss";

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

export interface ModifierViewProps {
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
}
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
          return <p className="ron-mod-input_readonly-value">{input}</p>;
        }
        return (
          <InputNumber
            className="ron-mod-input__input-number"
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
          return label ? <p className="ron-mod-input__readonly-value">{label}</p> : null;
        }
        return (
          <Select
            className="ron-mod-input__select"
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
    <div className={clsx("ron-modifier-view", className)}>
      <div className="ron-mod-heading">
        {headingNode}
        {headingSuffix}
      </div>
      {typeof description === "string" ? (
        <div className="ron-mod-description" dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <div className="ron-mod-description">{description}</div>
      )}

      {inputConfigs.length ? (
        <div
          className={clsx(
            "ron-mod-input__list ron-list",
            mutable ? "ron-mod-input__list--mutable" : "ron-mod-input__list--immutable"
          )}
        >
          {inputConfigs.map((config, i) => (
            <div key={i} className="ron-mod-input__item" aria-label={config.label}>
              <span className="ron-mod-input__item-label">{config.label}</span>

              {renderInput(i)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
