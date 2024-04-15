import clsx from "clsx";
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
  mutable?: boolean;
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
  mutable,
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

  return (
    <div className="ron-modifier-view">
      <div className="ron-mod-heading">
        {mutable ? (
          <Checkbox checked={checked} onChange={onToggle}>
            {heading}
          </Checkbox>
        ) : (
          <span>+ {heading}</span>
        )}
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
            <div key={i} className="ron-mod-input__item">
              <span className="ron-mod-input__item-label">{config.label}</span>

              {renderInput(i)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
