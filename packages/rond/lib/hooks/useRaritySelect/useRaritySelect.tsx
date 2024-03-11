import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import { Checkbox } from "../../components/Checkbox";
import { Rarity } from "../../components/Rarity";
import "./RaritySelect.styles.scss";

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

  const renderRaritySelect = (className?: ClassValue, style?: React.CSSProperties) => {
    return (
      <div className={clsx("ron-rarity-select", className)} style={style}>
        {options.map((option) => {
          const selected = rarities.includes(option);

          return (
            <Checkbox
              key={option}
              className="ron-rarity-select-option"
              checked={selected}
              onChange={() => onClickRarity(option, selected)}
            >
              <Rarity value={option} />
            </Checkbox>
          );
        })}
      </div>
    );
  };

  return {
    selectedRarities: rarities,
    updateRarities,
    renderRaritySelect,
  };
};
