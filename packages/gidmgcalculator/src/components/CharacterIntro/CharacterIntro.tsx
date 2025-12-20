import { FaSyncAlt, FaUserSlash } from "react-icons/fa";
import { Badge, Button, Rarity, VersatileSelect } from "rond";

import type { Level } from "@/types";

import { LEVELS } from "@/constants/global";
import { CalcCharacter } from "@/models/base";
import { GenshinImage } from "../GenshinImage";

type CharacterIntroProps = {
  className?: string;
  character: CalcCharacter;
  switchable?: boolean;
  removable?: boolean;
  /** Default true */
  mutable?: boolean;
  onSwitch?: () => void;
  onRemove?: () => void;
  onChangeLevel?: (newLevel: Level) => void;
  onChangeCons?: (newCons: number) => void;
  onEnhanceToggle?: (enhanced: boolean) => void;
};

export function CharacterIntro(props: CharacterIntroProps) {
  const { className = "", character, mutable = true } = props;
  const { data } = character;
  const elmtText = `text-${data.vision}`;

  return (
    <div className={`flex relative ${className}`}>
      <div
        className="mr-2 relative shrink-0"
        onClick={props.switchable ? props.onSwitch : undefined}
        style={{ width: "5.25rem", height: "5.25rem" }}
      >
        <GenshinImage
          className="cursor-pointer"
          src={data.icon}
          imgType="character"
          fallbackCls="p-2"
        />

        {props.switchable ? (
          <Button className="absolute -top-1 -left-1 z-10" size="small" icon={<FaSyncAlt />} />
        ) : null}

        <Badge active={data.beta} className="absolute -top-1 -right-1 z-10">
          BETA
        </Badge>
      </div>

      <div className="min-w-0 grow">
        <div className="overflow-hidden">
          <h2
            className={`text-2xl leading-7 truncate ${elmtText} font-black ${
              props.removable ? "pr-9" : ""
            }`}
            onDoubleClick={() => console.log(character)}
          >
            {data.name}
          </h2>

          <div className="flex items-center">
            <Rarity value={data.rarity} />

            <div
              className="ml-2 pl-2 border-l border-dark-line leading-none cursor-pointer"
              hidden={!data.enhanceType}
              onClick={() => props.onEnhanceToggle?.(!character.enhanced)}
            >
              <p className={character.enhanced ? "text-active" : "text-light-hint/80"}>Hexerei</p>
            </div>
          </div>
        </div>

        <div className="mt-2 pl-1 flex justify-between items-center">
          <div className="flex items-center text-lg" aria-label="calculator_character-level">
            <label className="mr-1">Level</label>
            <VersatileSelect
              title="Select Level"
              align="right"
              transparent
              showAllOptions
              className={`w-[98px] shrink-0 ${elmtText} text-lg font-bold`}
              dropdownCls="z-30"
              options={LEVELS.map((_, i) => {
                const item = LEVELS[LEVELS.length - 1 - i];
                return { label: item, value: item };
              })}
              value={character.level}
              onChange={(value) => props.onChangeLevel?.(value as Level)}
            />
          </div>

          <VersatileSelect
            title="Select Constellation"
            className={`ml-auto w-14 text-lg ${elmtText} font-bold bg-dark-2`}
            align="right"
            options={Array.from({ length: 7 }, (_, i) => ({
              label: `C${i}`,
              value: i,
            }))}
            value={character.cons}
            onChange={(newCons) => props.onChangeCons?.(newCons as number)}
          />
        </div>
      </div>

      {props.removable && (
        <Button
          className="absolute top-0 right-0"
          boneOnly
          icon={<FaUserSlash />}
          onClick={props.onRemove}
        />
      )}
    </div>
  );
}
