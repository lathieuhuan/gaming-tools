import { CgPushChevronUp } from "react-icons/cg";
import { clsx, type ClassValue } from "rond";

interface ArtifactLevelSelectProps {
  className?: ClassValue;
  mutable?: boolean;
  rarity: number;
  level: number;
  maxLevel?: number;
  onChangeLevel?: (newLevel: number) => void;
}
export function ArtifactLevelSelect({
  className,
  mutable,
  rarity,
  level,
  maxLevel = 0,
  onChangeLevel,
}: ArtifactLevelSelectProps) {
  const cls = `px-2 pt-2 pb-1.5 text-lg text-rarity-${rarity} leading-none font-bold`;

  if (mutable) {
    const disabled = level === maxLevel;

    return (
      <div className={clsx("rounded bg-dark-700 overflow-hidden flex", className)}>
        <select
          className={clsx("appearance-none", cls)}
          value={level}
          onChange={(e) => onChangeLevel?.(+e.target.value)}
        >
          {[...Array(maxLevel / 4 + 1).keys()].map((_, lv) => (
            <option key={lv} className="text-base" value={lv * 4}>
              +{lv * 4}
            </option>
          ))}
        </select>
        <button
          className={clsx(
            "px-1.5 text-xl bg-light-400 text-black flex-center",
            disabled ? "opacity-50" : "glow-on-hover"
          )}
          disabled={disabled}
          onClick={() => onChangeLevel?.(maxLevel)}
        >
          <CgPushChevronUp />
        </button>
      </div>
    );
  }
  return <p className={clsx("rounded bg-dark-500", cls, className)}>+{level}</p>;
}
