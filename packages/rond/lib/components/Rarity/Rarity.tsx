import clsx, { type ClassValue } from "clsx";
import { StarSvg } from "../svg-icons";
import { Button } from "../Button";
import "./Rarity.styles.scss";

export interface RarityProps {
  className?: ClassValue;
  value: number;
  mutable?: {
    max: number;
    min?: number;
  };
  /** Default to 'medium' if mutable, to 'small' otherwise */
  size?: "small" | "medium";
  onChange?: (rarity: number) => void;
}
export const Rarity = ({ className, mutable, size = mutable ? "medium" : "small", value, onChange }: RarityProps) => {
  const cls = clsx(`ron-rarity ron-rarity-${value}`, className);

  if (mutable) {
    return (
      <div className={cls}>
        {Array.from({ length: mutable.max }, (_, i) => {
          const rarity = i + 1;
          const inactive = rarity > value;

          return (
            <Button
              key={i}
              className={clsx("ron-rarity__button", inactive && "ron-rarity__button--inactive")}
              variant="custom"
              withShadow={false}
              icon={<StarSvg className={`ron-rarity--${size}`} />}
              size={size}
              disabled={!!mutable.min && rarity < mutable.min}
              onClick={() => {
                if (rarity !== value) onChange?.(rarity);
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={cls}>
      {Array.from({ length: value }, (_, i) => (
        <StarSvg key={i} className={`ron-rarity--${size}`} />
      ))}
    </div>
  );
};
