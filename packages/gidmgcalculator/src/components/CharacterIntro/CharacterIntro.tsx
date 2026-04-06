import { FaSyncAlt, FaUserSlash } from "react-icons/fa";
import { Badge, Button, clsx, Rarity, VersatileSelect } from "rond";

import type { AppCharacter, RawCharacter, Level } from "@/types";

import { EnhanceTag } from "../EnhanceTag";
import { GenshinImage } from "../GenshinImage";
import { CharacterLevelControl } from "../LevelControl";

type CharacterIntroProps = {
  className?: string;
  character: RawCharacter & { data: AppCharacter };
  switchable?: boolean;
  removable?: boolean;
  /** Default true */
  mutable?: boolean;
  ids?: {
    enhanceTag?: string;
  };
  onSwitch?: () => void;
  onRemove?: () => void;
  onChangeLevel?: (newLevel: Level) => void;
  onChangeCons?: (newCons: number) => void;
  onEnhanceToggle?: (enhanced: boolean) => void;
};

export function CharacterIntro(props: CharacterIntroProps) {
  const { className = "", character, mutable = true, ids } = props;
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
            className={clsx(
              `text-2xl leading-7 truncate font-black`,
              elmtText,
              props.removable && "pr-9"
            )}
            onDoubleClick={() => console.info(character)}
          >
            {data.name}
          </h2>

          <div className="flex items-center">
            <Rarity value={data.rarity} />

            <div hidden={!data.enhanceType} className="mx-2 w-px h-4 bg-dark-line" />

            <EnhanceTag
              id={ids?.enhanceTag}
              mutable={mutable}
              character={character}
              onToggle={() => props.onEnhanceToggle?.(!character.enhanced)}
            />
          </div>
        </div>

        <div className="mt-2 pl-1 flex justify-between items-center">
          <div className="flex items-center text-lg" aria-label="calculator_character-level">
            <label className="mr-1">Level</label>
            {mutable ? (
              <CharacterLevelControl
                className={`w-24 ${elmtText} text-lg font-bold`}
                value={character.level}
                onChange={(value) => props.onChangeLevel?.(value)}
              />
            ) : (
              <p className={`${elmtText} text-lg font-bold`}>{character.level}</p>
            )}
          </div>

          {mutable ? (
            <VersatileSelect
              title="Select Constellation"
              className={`ml-auto w-14 text-lg ${elmtText} font-bold bg-dark-2`}
              align="right"
              options={Array.from({ length: 7 }, (_, i) => ({
                label: `C${i}`,
                value: i,
              }))}
              value={character.cons}
              onChange={(newCons) => props.onChangeCons?.(newCons)}
            />
          ) : (
            <p className={`ml-auto text-lg ${elmtText} font-bold`}>C{character.cons}</p>
          )}
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
