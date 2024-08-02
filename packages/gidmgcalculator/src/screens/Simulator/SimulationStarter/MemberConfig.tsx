import { FaSyncAlt } from "react-icons/fa";
import { Badge, Button, VersatileSelect } from "rond";
import { LEVELS, Level, LevelableTalentType } from "@Backend";

import { EquipmentDisplay, GenshinImage } from "@Src/components";
import { $AppCharacter } from "@Src/services";
import { SimulationMember } from "@Src/types";
import { genSequentialOptions } from "@Src/utils";
import { useTranslation } from "@Src/hooks";

interface MemberConfigProps {
  character?: SimulationMember;
  onSwitch: () => void;
  onChangeLevel: (newLevel: Level) => void;
  onChangeConstellation: (newConstellation: number) => void;
  onChangeTalentLevel: (type: LevelableTalentType, newLevel: number) => void;
}
export function MemberConfig({
  character,
  onSwitch,
  onChangeLevel,
  onChangeConstellation,
  onChangeTalentLevel,
}: MemberConfigProps) {
  const { t } = useTranslation();
  const appChar = character ? $AppCharacter.get(character.name) : null;
  const elmtText = appChar ? `text-${appChar.vision}` : "";
  const levelableTalentTypes: LevelableTalentType[] = ["NAs", "ES", "EB"];

  const imgWrapStyle: React.CSSProperties = {
    width: "4.5rem",
    height: "4.5rem",
  };

  if (!character || !appChar) {
    return (
      <div>
        <div className="flex">
          <div onClick={onSwitch} style={imgWrapStyle}>
            <GenshinImage className="cursor-pointer" imgType="character" fallbackCls="p-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        <div className="mr-2 relative shrink-0" onClick={onSwitch} style={imgWrapStyle}>
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
                onChange={(value) => onChangeLevel(value as Level)}
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
              onChange={(newCons) => onChangeConstellation(newCons as number)}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {levelableTalentTypes.map((talentType) => {
          const talent = appChar.activeTalents[talentType];

          return (
            <div key={talentType} className="px-3 py-2 bg-surface-2 rounded">
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
                  onChange={(value) => onChangeTalentLevel(talentType, +value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <EquipmentDisplay
        className="mt-3"
        compact
        weapon={character.weapon}
        artifacts={character.artifacts}
        onClickItem={() => {}}
      />
    </div>
  );
}
