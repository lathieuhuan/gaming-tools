import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Badge, Button, HiddenSpace, VersatileSelect, clsx } from "rond";
import { AppCharacter, LEVELS, Level, LevelableTalentType } from "@Backend";

import { ArtifactCard, EquipmentDisplay, GenshinImage, WeaponCard } from "@Src/components";
import { Artifact, SimulationMember, Weapon } from "@Src/types";
import { genSequentialOptions } from "@Src/utils";
import { useTranslation } from "@Src/hooks";

const levelableTalentTypes: LevelableTalentType[] = ["NAs", "ES", "EB"];

type MemberConfigCoreOnlyPropsKey = "chosenGearIndex" | "onClickItem";

interface MemberConfigCoreProps {
  className?: string;
  character: SimulationMember;
  appChar: AppCharacter;
  onSwitch: () => void;
  onChangeLevel: (newLevel: Level) => void;
  onChangeConstellation: (newConstellation: number) => void;
  onChangeTalentLevel: (type: LevelableTalentType, newLevel: number) => void;
  chosenGearIndex: number;
  onClickItem: (index: number) => void;
}
function MemberConfigCore(props: MemberConfigCoreProps) {
  const { t } = useTranslation();

  const { character, appChar } = props;
  const elmtText = `text-${appChar.vision}`;

  return (
    <div className={props.className}>
      <div className="flex">
        <div
          className="mr-2 relative shrink-0"
          onClick={props.onSwitch}
          style={{
            width: "4.5rem",
            height: "4.5rem",
          }}
        >
          <>
            <GenshinImage className="cursor-pointer" src={appChar.icon} imgType="character" fallbackCls="p-1" />
            <Button className="absolute -top-1 -left-1 z-10" size="small" icon={<FaSyncAlt />} />
            {/* <Badge active={appChar.beta} className="absolute -top-1 -right-1 z-10">
              BETA
            </Badge> */}
          </>
        </div>

        <div className="min-w-0 grow">
          <div className="overflow-hidden">
            <h3 className={`text-xl truncate ${elmtText} font-black`}>{character.name}</h3>
          </div>

          <div className="pl-1 flex justify-between items-center">
            <div className="flex items-center" aria-label="calculator_character-level">
              <label className="mr-1">Level</label>
              <VersatileSelect
                title="Select Level"
                align="right"
                transparent
                showAllOptions
                className={`shrink-0 ${elmtText} font-bold`}
                style={{ width: "4.75rem" }}
                dropdownCls="z-20"
                options={LEVELS.map((_, i) => {
                  const item = LEVELS[LEVELS.length - 1 - i];
                  return { label: item, value: item };
                })}
                value={character.level}
                onChange={(value) => props.onChangeLevel(value as Level)}
              />
            </div>

            <VersatileSelect
              title="Select Constellation Level"
              className={`ml-auto w-14 text-lg ${elmtText} font-bold bg-surface-2`}
              align="right"
              options={Array.from({ length: 7 }, (_, i) => ({
                label: `C${i}`,
                value: i,
              }))}
              value={character.cons}
              onChange={(newCons) => props.onChangeConstellation(newCons as number)}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {levelableTalentTypes.map((talentType) => {
          const talent = appChar.activeTalents[talentType];

          return (
            <div key={talentType} className="px-3 pt-2 pb-1 bg-surface-2 rounded">
              <p className="font-bold truncate">{talent.name}</p>
              <div className="flex items-center">
                <span className="text-sm text-hint-color">{t(talentType)}</span>

                <span className="ml-auto mr-1">Lv.</span>
                <VersatileSelect
                  title="Select Level"
                  className={`w-12 ${elmtText} font-bold`}
                  transparent
                  showAllOptions
                  value={character[talentType]}
                  options={genSequentialOptions(10)}
                  onChange={(value) => props.onChangeTalentLevel(talentType, +value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <EquipmentDisplay
        className="mt-3"
        compact
        fillable
        selectedIndex={props.chosenGearIndex}
        weapon={character.weapon}
        artifacts={character.artifacts}
        onClickItem={props.onClickItem}
        onClickEmptyArtifact={() => {}}
      />
    </div>
  );
}

interface MemberConfigProps extends Omit<MemberConfigCoreProps, MemberConfigCoreOnlyPropsKey> {
  onChangeWeapon: (config: Partial<Weapon>) => void;
  onChangeArtifact: (index: number, config: Partial<Artifact>) => void;
}
export function MemberConfig(props: MemberConfigProps) {
  const [chosenGearIndex, setChosenGrearIndex] = useState(-1);

  const onClickItem = (index: number) => {
    setChosenGrearIndex(index === chosenGearIndex ? -1 : index);
  };

  const weapon = props.character.weapon;
  const chosenArtifact = props.character.artifacts[chosenGearIndex];

  return (
    <div className="flex">
      <MemberConfigCore {...props} chosenGearIndex={chosenGearIndex} onClickItem={onClickItem} />

      <HiddenSpace active={chosenGearIndex !== -1} className="py-2 flex" afterClose={() => setChosenGrearIndex(-1)}>
        <div className={clsx(`h-full ml-px rounded-l-none bg-surface-1`, props.className)}>
          {chosenGearIndex === 5 ? (
            <WeaponCard
              withGutter={false}
              mutable
              weapon={weapon}
              upgrade={(level) => props.onChangeWeapon({ level })}
              refine={(refi) => props.onChangeWeapon({ refi })}
            />
          ) : null}
          {chosenArtifact ? (
            <ArtifactCard
              withGutter={false}
              mutable
              artifact={chosenArtifact}
              onEnhance={(level) => {
                props.onChangeArtifact(chosenGearIndex, {
                  level,
                });
              }}
              onChangeMainStatType={(mainStatType) => {
                props.onChangeArtifact(chosenGearIndex, {
                  mainStatType,
                });
              }}
              onChangeSubStat={(subStatIndex, change, artifact) => {
                const newSubStats = [...artifact.subStats];

                newSubStats[subStatIndex] = {
                  ...newSubStats[subStatIndex],
                  ...change,
                };

                props.onChangeArtifact(chosenGearIndex, {
                  subStats: newSubStats,
                });
              }}
            />
          ) : null}
        </div>
      </HiddenSpace>
    </div>
  );
}
