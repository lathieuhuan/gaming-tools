import { VersatileSelect } from "rond";

interface ArtifactLevelSelectProps {
  className?: string;
  mutable?: boolean;
  rarity: number;
  level: number;
  maxLevel?: number;
  onChangeLevel?: (newLevel: number) => void;
}
export function ArtifactLevelSelect({
  className = "",
  mutable,
  rarity,
  level,
  maxLevel = 0,
  onChangeLevel,
}: ArtifactLevelSelectProps) {
  if (mutable) {
    return (
      <VersatileSelect
        title="Select Level"
        className={`bg-dark-2 text-rarity-${rarity} font-bold ${className}`}
        style={{ width: "4.125rem" }}
        size="medium"
        align="right"
        options={Array.from({ length: maxLevel / 4 + 1 }, (_, i) => {
          const lv = i * 4;
          return {
            label: `+${lv}`,
            value: lv,
          };
        })}
        value={level}
        onChange={(newLv) => onChangeLevel?.(newLv as number)}
        action={{
          icon: (
            <svg width="1.375rem" height="1.375rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.5459 13.4541C19.7573 13.6654 19.876 13.9521 19.876 14.2509C19.876 14.5498 19.7573 14.8365 19.5459 15.0478C19.3346 15.2592 19.0479 15.3779 18.7491 15.3779C18.4502 15.3779 18.1635 15.2592 17.9522 15.0478L13.125 10.2188V21C13.125 21.2984 13.0065 21.5845 12.7955 21.7955C12.5845 22.0065 12.2984 22.125 12 22.125C11.7016 22.125 11.4155 22.0065 11.2045 21.7955C10.9935 21.5845 10.875 21.2984 10.875 21V10.2188L6.04594 15.0459C5.83459 15.2573 5.54795 15.376 5.24906 15.376C4.95018 15.376 4.66353 15.2573 4.45219 15.0459C4.24084 14.8346 4.12211 14.5479 4.12211 14.2491C4.12211 13.9502 4.24084 13.6635 4.45219 13.4522L11.2022 6.70219C11.3067 6.59731 11.4309 6.51409 11.5676 6.45731C11.7044 6.40053 11.851 6.3713 11.9991 6.3713C12.1471 6.3713 12.2937 6.40053 12.4305 6.45731C12.5672 6.51409 12.6914 6.59731 12.7959 6.70219L19.5459 13.4541ZM20.25 2.625H3.75C3.45163 2.625 3.16548 2.74353 2.9545 2.9545C2.74353 3.16548 2.625 3.45163 2.625 3.75C2.625 4.04837 2.74353 4.33452 2.9545 4.5455C3.16548 4.75647 3.45163 4.875 3.75 4.875H20.25C20.5484 4.875 20.8345 4.75647 21.0455 4.5455C21.2565 4.33452 21.375 4.04837 21.375 3.75C21.375 3.45163 21.2565 3.16548 21.0455 2.9545C20.8345 2.74353 20.5484 2.625 20.25 2.625Z"
                fill="black"
              />
            </svg>
          ),
          disabled: level === maxLevel,
          onClick: () => onChangeLevel?.(maxLevel),
        }}
      />
    );
  }
  return (
    <p
      className={`px-2 pt-2 pb-1.5 text-lg text-rarity-${rarity} leading-none font-bold rounded bg-dark-3 ${className}`}
    >
      +{level}
    </p>
  );
}
