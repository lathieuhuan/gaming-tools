import Dropdown from "@rc-component/dropdown";
import { ChevronDownSvg, ClassValue, cn } from "rond";

import { Ascendable } from "@/models";
import { Level } from "@/types";
import { LevelMenu, LevelMenuProps } from "./LevelMenu";
import { useControllableState } from "@/hooks/useControllableState";

export type LevelControlProps = Pick<LevelMenuProps, "levelCaps"> & {
  className?: ClassValue;
  menuCls?: LevelMenuProps["classNames"];
  value?: Level;
  defaultValue?: Level;
  onChange?: (newLevel: Level) => void;
};

export function LevelControl({
  className,
  menuCls,
  value,
  defaultValue = "1/20",
  levelCaps = [],
  onChange,
}: LevelControlProps) {
  const [level, setLevel] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });

  const { bareLv, lvCap } = Ascendable.splitLevel(level);

  const handleChange = (values: { level?: number; lvCap?: number }) => {
    const newLv = values.level ?? bareLv;
    const newLvCap = values.lvCap ?? lvCap;

    setLevel(`${newLv}/${newLvCap}` as Level);
  };

  const handleLevelChange = (newLevel: number) => {
    const possibleLvCaps = Ascendable.getPossibleLvCaps(newLevel, levelCaps);

    if (possibleLvCaps.includes(lvCap)) {
      handleChange({ level: newLevel });
      return;
    }

    handleChange({
      level: newLevel,
      lvCap: possibleLvCaps[1] ?? possibleLvCaps[0],
    });
  };

  const handleSelectLvCap = (lvCap: number) => {
    handleChange({ lvCap });
  };

  return (
    <Dropdown
      trigger="click"
      autoDestroy
      overlay={
        <LevelMenu
          classNames={menuCls}
          level={bareLv}
          levelCap={lvCap}
          levelCaps={levelCaps}
          onSelectLevel={handleLevelChange}
          onSelectLevelCap={handleSelectLvCap}
        />
      }
    >
      <div className={cn("font-medium flex items-center justify-end cursor-default", className)}>
        <span>{level}</span>
        <div className="w-6 flex-center shrink-0">
          <ChevronDownSvg className="text-xs" />
        </div>
      </div>
    </Dropdown>
  );
}
