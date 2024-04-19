import { CgPushChevronUp } from "react-icons/cg";
import { VersatileSelect, type VersatileSelectProps } from "rond";

interface ArtifactLevelSelectProps {
  className?: string;
  mutable?: boolean;
  rarity: number;
  level: number;
  maxLevel?: number;
  onChangeLevel?: (newLevel: number) => void;
  getContainer?: VersatileSelectProps["getPopupContainer"];
}
export function ArtifactLevelSelect({
  className = "",
  mutable,
  rarity,
  level,
  maxLevel = 0,
  onChangeLevel,
  getContainer,
}: ArtifactLevelSelectProps) {
  if (mutable) {
    return (
      <VersatileSelect
        title="Select Level"
        className={`bg-surface-2 text-rarity-${rarity} font-bold ${className}`}
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
        getPopupContainer={getContainer}
        value={level}
        onChange={(newLv) => onChangeLevel?.(newLv as number)}
        action={{
          icon: <CgPushChevronUp className="text-xl" />,
          disabled: level === maxLevel,
          onClick: () => onChangeLevel?.(maxLevel),
        }}
      />
    );
  }
  return (
    <p
      className={`px-2 pt-2 pb-1.5 text-lg text-rarity-${rarity} leading-none font-bold rounded bg-surface-3 ${className}`}
    >
      +{level}
    </p>
  );
}
