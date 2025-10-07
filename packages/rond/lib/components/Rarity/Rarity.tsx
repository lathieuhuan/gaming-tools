import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { StarSvg } from "../svg-icons";
import { Button } from "../Button";

type Size = "small" | "medium";

const classBySize: Record<Size, string> = {
  small: "text-lg",
  medium: "text-[1.625rem]",
};

export type RarityProps = {
  className?: ClassValue;
  value: number;
  mutable?: {
    max: number;
    min?: number;
  };
  /** Default 'medium' if mutable, to 'small' otherwise */
  size?: Size;
  onChange?: (rarity: number) => void;
};

export const Rarity = ({
  className,
  mutable,
  size = mutable ? "medium" : "small",
  value,
  onChange,
}: RarityProps) => {
  const cls = cn(`flex items-center text-rarity-${value}`, className);

  if (mutable) {
    return (
      <div className={cls}>
        {Array.from({ length: mutable.max }, (_, i) => {
          const rarity = i + 1;
          const inactive = rarity > value;

          return (
            <Button
              key={i}
              className={inactive ? "text-rarity-1" : "text-inherit"}
              variant="custom"
              withShadow={false}
              icon={<StarSvg className={classBySize[size]} />}
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
        <StarSvg key={i} className={classBySize[size]} />
      ))}
    </div>
  );
};
