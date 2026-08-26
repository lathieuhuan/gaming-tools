import { validCapsOfLevel } from "@/logic/level.logic";
import { ClassValue, clsx, cn } from "rond";

export type LevelMenuProps = {
  classNames?: {
    root?: ClassValue;
    capColumn?: ClassValue;
  };
  level?: number;
  levelCap?: number;
  allLevelCaps?: number[];
  onSelectLevel?: (level: number) => void;
  onSelectLevelCap?: (levelCap: number) => void;
};

export function LevelMenu({
  classNames = {},
  level = 1,
  levelCap,
  allLevelCaps = [],
  onSelectLevel,
  onSelectLevelCap,
}: LevelMenuProps) {
  const lvOptions = allLevelCaps.concat(1);
  const selectedLv = lvOptions.includes(level) ? level : undefined;
  const lvCapOptions = validCapsOfLevel(level, allLevelCaps);

  const handleSelectLv = (newLevel: number) => {
    if (newLevel !== level) {
      onSelectLevel?.(newLevel);
    }
  };

  return (
    <div
      className={cn(
        "h-fit flex bg-light-2 text-black text-base rounded-sm overflow-clip",
        classNames.root,
      )}
    >
      <div className="grow custom-scrollbar border-r border-black/40 cursor-default">
        {lvOptions.map((lvOption, index) => (
          <div
            key={index}
            className={clsx(
              "min-h-7 pr-2 flex items-center justify-end",
              lvOption === selectedLv ? "bg-primary-1" : "hover:bg-light-4",
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectLv(lvOption);
            }}
          >
            <span>{lvOption}</span>
          </div>
        ))}
      </div>

      <div className={cn("shrink-0 custom-scrollbar cursor-default", classNames.capColumn)}>
        {lvCapOptions.map((lvCapOption, index) => {
          const selected = lvCapOption === levelCap;

          return (
            <div
              key={index}
              className={clsx(
                "min-h-7 pr-2 flex items-center justify-end",
                selected ? "bg-primary-1" : "hover:bg-light-4",
              )}
              onClick={() => {
                if (!selected) {
                  onSelectLevelCap?.(lvCapOption);
                }
              }}
            >
              <span>{lvCapOption}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
