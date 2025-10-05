import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { Checkbox } from "../Checkbox";
import { Rarity } from "../Rarity";

export type RaritySelectProps = {
  className?: ClassValue;
  style?: React.CSSProperties;
  options?: number[];
  values?: number[];
  onSelect?: (value: number, currentSelected: boolean) => void;
};

export function RaritySelect(props: RaritySelectProps) {
  return (
    <div className={cn("flex flex-col gap-3", props.className)} style={props.style}>
      {props.options?.map((option) => {
        const selected = props.values?.includes(option) === true;

        return (
          <Checkbox
            key={option}
            className="rounded-sm border border-dark-3 p-2"
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
