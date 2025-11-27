import { useEffect, useMemo, useRef, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { CloseButton, LoadingSpin, StatsTable, VersatileSelect, round } from "rond";

import type { AppCharacter, TalentType } from "@/types";

import { getTalentDefaultValues } from "@/calculation-new/calculator/getTalentDefaultValues";
import { ATTACK_PATTERNS } from "@/constants";
import { useQuery, useTabs, useTranslation } from "@/hooks";
import { Character } from "@/models/base";
import { $AppCharacter } from "@/services";
import { genSequentialOptions } from "@/utils";
import Array_ from "@/utils/Array";
import { NORMAL_ATTACK_ICONS } from "./_constants";

// Component
import { markDim } from "../../span";
import { AbilityCarousel } from "../_components/AbilityCarousel";

const useTalentDescriptions = (characterName: string, auto: boolean) => {
  return useQuery([characterName], () => $AppCharacter.fetchTalentDescriptions(characterName), {
    auto,
  });
};

type TalentDetailProps = {
  character: AppCharacter;
  detailIndex: number;
  onChangeDetailIndex: (newIndex: number) => void;
  onClose: () => void;
};

export function TalentDetail({
  character,
  detailIndex,
  onChangeDetailIndex,
  onClose,
}: TalentDetailProps) {
  const { t } = useTranslation();
  const { weaponType, vision, activeTalents, passiveTalents } = character;
  const { ES, EB, altSprint } = activeTalents;
  const isPassiveTalent = detailIndex > Object.keys(activeTalents).length - 1;
  const images = [NORMAL_ATTACK_ICONS[`${weaponType}_${vision}`] || "", ES.image, EB.image];

  const [talentLevel, setTalentLevel] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout>();

  const { activeIndex, tabProps, setActiveIndex, Tabs } = useTabs(1);

  const {
    isLoading,
    isError,
    data: descriptions,
  } = useTalentDescriptions(character.name, !activeIndex);

  if (altSprint) {
    images.push(altSprint.image);
  }
  for (const talent of passiveTalents) {
    images.push(talent.image);
  }

  useEffect(() => {
    // Passive talents have no Skill Attributes
    if (isPassiveTalent && activeIndex === 1) {
      setActiveIndex(0);
    }
  }, [isPassiveTalent]);

  const talents = useMemo(() => processTalents(character, talentLevel, t), [talentLevel]);

  const talent = talents[detailIndex];
  const levelable = talent?.type !== "altSprint";

  const onClickBack = () => {
    onChangeDetailIndex(detailIndex - 1);
  };

  const onClickNext = () => {
    onChangeDetailIndex(detailIndex + 1);
  };

  const onMouseDownLevelButton = (isLevelUp: boolean) => {
    let level = talentLevel;

    const adjustLevel = () => {
      if (isLevelUp ? level < 15 : level > 1) {
        setTalentLevel((prev) => {
          level = isLevelUp ? prev + 1 : prev - 1;
          return level;
        });
      }
    };

    adjustLevel();
    intervalRef.current = setInterval(adjustLevel, 150);
  };

  const renderLevelButton = (isLevelUp: boolean, disabled: boolean) => {
    return (
      <button
        className={
          "w-7 h-7 flex-center rounded border-2 border-dark-line text-dark-line text-1.5xl " +
          (disabled ? "opacity-50" : "hover:border-secondary-1 hover:text-secondary-1")
        }
        disabled={disabled}
        onMouseDown={() => onMouseDownLevelButton(isLevelUp)}
        onMouseUp={() => clearInterval(intervalRef.current)}
        onMouseLeave={() => clearInterval(intervalRef.current)}
      >
        <FaCaretDown className={isLevelUp ? "rotate-180" : ""} />
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="hide-scrollbar">
        <AbilityCarousel
          className="pt-1 pb-2"
          label={t(talent.type)}
          currentIndex={detailIndex}
          images={images}
          vision={vision}
          onClickBack={onClickBack}
          onClickNext={onClickNext}
        />

        <p className={`text-lg font-semibold text-${vision} text-center`}>{talent.name}</p>
        <Tabs
          {...tabProps}
          className="my-2"
          configs={[
            {
              text: "Talent Info",
            },
            {
              text: "Skill Attributes",
              disabled: isPassiveTalent,
            },
          ]}
        />

        {activeIndex ? (
          <div>
            <div className="py-2 flex-center bg-dark-1 sticky -top-1">
              {levelable ? (
                <div className="flex items-center space-x-4">
                  {renderLevelButton(false, talentLevel <= 1)}
                  <div className="flex items-center text-lg">
                    <p>Lv.</p>
                    <VersatileSelect
                      title="Select Level"
                      className="w-12 font-bold text-lg"
                      align="right"
                      transparent
                      value={talentLevel}
                      options={genSequentialOptions(15)}
                      onChange={(value) => setTalentLevel(+value)}
                    />
                  </div>
                  {renderLevelButton(true, talentLevel >= 15)}
                </div>
              ) : (
                <p className="text-lg">
                  Lv. <span className="font-bold">1</span>
                </p>
              )}
            </div>

            <StatsTable>
              {talent.stats.map((stat, i) => {
                return (
                  <StatsTable.Row key={i} className="pb-1 text-sm">
                    <p className="pr-6">{stat.name}</p>
                    <p className="font-semibold text-right">{stat.value}</p>
                  </StatsTable.Row>
                );
              })}
            </StatsTable>
          </div>
        ) : (
          <p className={isLoading ? "py-4 flex justify-center" : "mt-4 whitespace-pre-wrap"}>
            <LoadingSpin active={isLoading} />
            {isError && markDim("Error. Rebooting...")}
            {descriptions?.[detailIndex]}
          </p>
        )}
      </div>

      <div className="mt-3">
        <CloseButton className="mx-auto" size="small" onClick={onClose} />
      </div>
    </div>
  );
}

type ProcessedStat = {
  name: string;
  value: string | number;
};

type ProcessedTalentType = TalentType | "A1" | "A4" | "utility";

type ProcessedTalent = {
  name: string;
  label: string;
  type: ProcessedTalentType;
  stats: ProcessedStat[];
};

function processTalents(
  character: AppCharacter,
  level: number,
  translate: (word: string) => string
): ProcessedTalent[] {
  const { NAs, ES, EB, altSprint } = character.activeTalents;

  const result: ProcessedTalent[] = [
    { name: NAs.name, type: "NAs", label: translate("NAs"), stats: [] },
    { name: ES.name, type: "ES", label: translate("ES"), stats: [] },
    { name: EB.name, type: "EB", label: translate("EB"), stats: [] },
  ];

  for (const attPatt of ATTACK_PATTERNS) {
    const default_ = getTalentDefaultValues(
      character,
      attPatt,
      attPatt === "ES" || attPatt === "EB"
    );
    const resultKey = attPatt === "ES" || attPatt === "EB" ? attPatt : "NAs";
    const talent = result.find((item) => item.type === resultKey);
    if (!talent) continue;

    for (const stat of character.calcList[attPatt]) {
      const factors = Array_.toArray(stat.factor);
      const { flatFactor } = stat;
      const factorStrings = [];

      if (factors.some((factor) => typeof factor !== "number" && factor.scale === 0)) {
        continue;
      }

      for (const factor of factors) {
        const {
          root,
          scale = default_.scale,
          basedOn = default_.basedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        if (scale && root) {
          let string = round(root * Character.getTalentMult(scale, level), 2) + "%";

          if (basedOn) {
            string += ` ${translate(basedOn)}`;
          }

          factorStrings.push(string);
        }
      }

      if (flatFactor) {
        const { root, scale = default_.flatFactorScale } =
          typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;

        factorStrings.push(Math.round(root * (scale ? Character.getTalentMult(scale, level) : 1)));
      }

      talent.stats.push({
        name: stat.name,
        value: factorStrings.join(" + "),
      });
    }
  }

  result[2].stats.push({
    name: "Energy cost",
    value: character.EBcost,
  });

  if (altSprint) {
    result.push({
      name: altSprint.name,
      type: "altSprint",
      label: translate("altSprint"),
      stats: [],
    });
  }

  const passiveTypes = ["A1", "A4", "utility"] as const;
  const passiveLabels = ["Ascension 1", "Ascension 4", "Utility"];

  result.push(
    ...character.passiveTalents.map<ProcessedTalent>((talent, i) => {
      return {
        name: talent.name,
        type: passiveTypes[i],
        label: passiveLabels[i],
        stats: [],
      };
    })
  );

  return result;
}
