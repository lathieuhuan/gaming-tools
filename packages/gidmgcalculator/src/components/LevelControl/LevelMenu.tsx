import { ClassValue, clsx, cn } from "rond";
import { Ascendable } from "@/models";

export type LevelMenuProps = {
  classNames?: {
    root?: ClassValue;
    capColumn?: ClassValue;
  };
  level?: number;
  levelCap?: number;
  levelCaps?: number[];
  onSelectLevel?: (level: number) => void;
  onSelectLevelCap?: (levelCap: number) => void;
};

export function LevelMenu({
  classNames = {},
  level: levelProp = 1,
  levelCap: levelCapProp,
  levelCaps = [],
  onSelectLevel,
  onSelectLevelCap,
}: LevelMenuProps) {
  const lvOptions = levelCaps.concat(1);
  const selectedLv = lvOptions.includes(levelProp) ? levelProp : undefined;
  const lvCapOptions = Ascendable.getPossibleLvCaps(levelProp, levelCaps);

  const handleSelectLv = (level: number) => {
    if (level !== levelProp) {
      onSelectLevel?.(level);
    }
  };

  return (
    <div
      className={cn(
        "h-fit flex bg-light-2 text-black text-base rounded-sm overflow-clip",
        classNames.root
      )}
    >
      <div className="grow custom-scrollbar border-r border-black/40 cursor-default">
        {lvOptions.map((level, index) => (
          <div
            key={index}
            className={clsx(
              "min-h-7 pr-2 flex items-center justify-end",
              level === selectedLv ? "bg-primary-1" : "hover:bg-light-4"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectLv(level);
            }}
          >
            <span>{level}</span>
          </div>
        ))}
      </div>

      <div className={cn("shrink-0 custom-scrollbar cursor-default", classNames.capColumn)}>
        {lvCapOptions.map((lvCap, index) => {
          const selected = lvCap === levelCapProp;

          return (
            <div
              key={index}
              className={clsx(
                "min-h-7 pr-2 flex items-center justify-end",
                selected ? "bg-primary-1" : "hover:bg-light-4"
              )}
              onClick={() => {
                if (!selected) {
                  onSelectLevelCap?.(lvCap);
                }
              }}
            >
              <span>{lvCap}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
