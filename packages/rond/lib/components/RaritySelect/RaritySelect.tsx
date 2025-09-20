import clsx, { ClassValue } from "clsx";
import { Checkbox } from "../Checkbox";
import { Rarity } from "../Rarity";
import "./RaritySelect.styles.scss";

export type RaritySelectProps = {
  className?: ClassValue;
  style?: React.CSSProperties;
  options?: number[];
  values?: number[];
  onSelect?: (value: number, currentSelected: boolean) => void;
};

export function RaritySelect(props: RaritySelectProps) {
  return (
    <div className={clsx("ron-rarity-select", props.className)} style={props.style}>
      {props.options?.map((option) => {
        const selected = props.values?.includes(option) === true;

        return (
          <Checkbox
            key={option}
            className="ron-rarity-select-option"
            checked={selected}
            onChange={() => props.onSelect?.(option, selected)}
          >
            <Rarity value={option} />
          </Checkbox>
        );
      })}
    </div>
  );
}
