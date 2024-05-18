import { FaSyncAlt, FaUserSlash } from "react-icons/fa";
import { Badge, Button, Rarity, VersatileSelect } from "rond";
import { AppCharacter, Level } from "@Backend";

import type { Character } from "@Src/types";
import { LEVELS } from "@Backend";
import { GenshinImage } from "../GenshinImage";

interface CharacterIntroProps {
  className?: string;
  char: Character;
  appChar: AppCharacter;
  switchable?: boolean;
  removable?: boolean;
  /** Default to true */
  mutable?: boolean;
  onSwitch?: () => void;
  onRemove?: () => void;
  onChangeLevel?: (newLevel: Level) => void;
  onChangeCons?: (newCons: number) => void;
}
export function CharacterIntro(props: CharacterIntroProps) {
  const { className = "", char, appChar, mutable = true } = props;
  const elmtText = `text-${appChar.vision}`;

  return (
    <div className={`flex relative ${className}`}>
      <div
        className="mr-3 relative shrink-0"
        onClick={props.switchable ? props.onSwitch : undefined}
        style={{ width: "5.25rem", height: "5.25rem" }}
      >
        <GenshinImage className="cursor-pointer" src={appChar.icon} imgType="character" fallbackCls="p-2" />
        {props.switchable && <Button className="absolute -top-1 -left-1 z-10" icon={<FaSyncAlt />} />}
        <Badge active={appChar.beta} className="absolute -top-1 -right-1 z-10">
          BETA
        </Badge>
      </div>

      <div className="min-w-0 grow">
        <div className="overflow-hidden">
          <h2 className={`text-2xl truncate ${elmtText} font-black ${props.removable ? "pr-9" : ""}`}>{char.name}</h2>
          <Rarity value={appChar.rarity} />
        </div>

        <div className="mt-1 pl-1 flex justify-between items-center">
          <div className="flex items-center text-lg">
            <label className="mr-1" htmlFor="calculator_character-level">
              Level
            </label>
            <VersatileSelect
              id="calculator_character-level"
              title="Select Level"
              align="right"
              transparent
              showAllOptions
              className={`shrink-0 ${elmtText} text-lg font-bold`}
              style={{ width: "4.75rem" }}
              dropdownCls="z-20"
              options={LEVELS.map((_, i) => {
                const item = LEVELS[LEVELS.length - 1 - i];
                return { label: item, value: item };
              })}
              value={char.level}
              onChange={(value) => props.onChangeLevel?.(value as Level)}
            />
          </div>

          <VersatileSelect
            id="calculator_character-constellation"
            title="Select Constellation Level"
            className={`ml-auto w-14 text-lg ${elmtText} font-bold bg-surface-2`}
            align="right"
            options={Array.from({ length: 7 }, (_, i) => ({
              label: `C${i}`,
              value: i,
            }))}
            value={char.cons}
            onChange={(newCons) => props.onChangeCons?.(newCons as number)}
          />
        </div>
      </div>

      {props.removable && (
        <Button className="absolute top-0 right-0" boneOnly icon={<FaUserSlash />} onClick={props.onRemove} />
      )}
    </div>
  );
}
