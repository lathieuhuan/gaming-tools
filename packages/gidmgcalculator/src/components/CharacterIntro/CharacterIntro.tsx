import { FaSyncAlt, FaUserSlash } from "react-icons/fa";
import { Badge, Button, Rarity } from "rond";
import type { AppCharacter, Character, Level } from "@Src/types";
import { LEVELS } from "@Src/constants";
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
    <div className={"flex relative " + className}>
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
          <p className={`text-2xl truncate ${elmtText} font-black`}>{char.name}</p>
          <Rarity value={appChar.rarity} />
        </div>

        <div className="mt-1 pl-1 flex justify-between items-center">
          <div className="flex items-center text-lg">
            <p className="mr-1">Level</p>
            <select
              className={`text-right text-last-right ${elmtText} font-bold`}
              value={char.level}
              onChange={(e) => props.onChangeLevel?.(e.target.value as Level)}
            >
              {LEVELS.map((lv, i) => (
                <option key={i} className="text-black">
                  {LEVELS[LEVELS.length - 1 - i]}
                </option>
              ))}
            </select>
          </div>

          <div
            className={
              "ml-4 px-3 pt-2 pb-1.5 flex-center rounded-lg bg-surface-2 " +
              `leading-none ${elmtText} font-bold cursor-default relative group`
            }
          >
            <span>C{char.cons}</span>
            <div className="absolute top-full z-50 pt-1 hidden group-hover:block">
              <ul className="bg-light-default text-black rounded overflow-hidden">
                {[...Array(7)].map((_, i) => {
                  return (
                    <li
                      key={i}
                      className={`px-3 pt-2 pb-1.5 ${i === char.cons ? "bg-light-disabled" : "hover:bg-primary-1"}`}
                      onClick={() => props.onChangeCons?.(i)}
                    >
                      C{i}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {props.removable && (
        <Button className="absolute top-0 right-0" boneOnly icon={<FaUserSlash />} onClick={props.onRemove} />
      )}
    </div>
  );
}
