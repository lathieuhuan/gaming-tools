import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import { Checkbox } from "../../components/Checkbox";
import { Rarity } from "../../components/Rarity";
import "./RaritySelect.styles.scss";

interface RaritySelectProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  options?: number[];
  value?: number[];
  onClickRarity?: (value: number, currentSelected: boolean) => void;
}
function RaritySelect(props: RaritySelectProps) {
  return (
    <div className={clsx("ron-rarity-select", props.className)} style={props.style}>
      {props.options?.map((option) => {
        const selected = props.value?.includes(option) === true;

        return (
          <Checkbox
            key={option}
            className="ron-rarity-select-option"
            checked={selected}
            onChange={() => props.onClickRarity?.(option, selected)}
          >
            <Rarity value={option} />
          </Checkbox>
        );
      })}
    </div>
  );
}

type Config = {
  onChange?: (rarities: number[]) => void;
};

export const useRaritySelect = (options: number[], initialValues?: number[] | null, config?: Config) => {
  const [rarities, setRarities] = useState(initialValues ?? []);
  const { onChange } = config || {};

  const updateRarities = (newRarities: number[]) => {
    setRarities(newRarities);
    onChange?.(newRarities);
  };

  const onClickRarity = (value: number, currentSelected: boolean) => {
    const newRarities = currentSelected ? rarities.filter((rarity) => rarity !== value) : rarities.concat(value);
    updateRarities(newRarities);
  };

  const raritySelectProps = {
    options,
    value: rarities,
    onClickRarity,
  } satisfies RaritySelectProps;

  return {
    selectedRarities: rarities,
    raritySelectProps,
    updateRarities,
    RaritySelect,
  };
};
