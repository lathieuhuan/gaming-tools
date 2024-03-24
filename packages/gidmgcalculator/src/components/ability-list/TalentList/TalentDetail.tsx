import { useState, useRef, useMemo, useEffect } from "react";
import { FaCaretDown } from "react-icons/fa";
import { CloseButton, LoadingSpin, StatsTable, round } from "rond";

import type { AppCharacter, Talent } from "@Src/types";
import { toArray, Character_ } from "@Src/utils";
import { useQuery, useTabs, useTranslation } from "@Src/hooks";
import { $AppCharacter } from "@Src/services";

// Constant
import { ATTACK_PATTERNS } from "@Src/constants";
import NORMAL_ATTACK_ICONS from "./normal-attack-icons";

// Component
import { Dim } from "../../span";
import { AbilityCarousel } from "../ability-list-components";

const useTalentDescriptions = (characterName: string, auto: boolean) => {
  return useQuery(characterName, () => $AppCharacter.fetchTalentDescriptions(characterName), { auto });
};

interface TalentDetailProps {
  appChar: AppCharacter;
  detailIndex: number;
  onChangeDetailIndex: (newIndex: number) => void;
  onClose: () => void;
}
export function TalentDetail({ appChar, detailIndex, onChangeDetailIndex, onClose }: TalentDetailProps) {
  const { t } = useTranslation();
  const { weaponType, vision: elementType, activeTalents, passiveTalents } = appChar;
  const { ES, EB, altSprint } = activeTalents;
  const isPassiveTalent = detailIndex > Object.keys(activeTalents).length - 1;
  const images = [NORMAL_ATTACK_ICONS[`${weaponType}_${elementType}`] || "", ES.image, EB.image];

  const [talentLevel, setTalentLevel] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout>();

  const { activeIndex, setActiveIndex, renderTabs } = useTabs({
    level: 2,
    defaultIndex: 1,
    configs: [{ text: "Talent Info" }, { text: "Skill Attributes" }],
  });

  const { isLoading, isError, data: descriptions } = useTalentDescriptions(appChar.name, !activeIndex);

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

  const talents = useMemo(() => processTalents(appChar, talentLevel, t), [talentLevel]);

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
          "w-7 h-7 flex-center rounded border-2 border-surface-border text-surface-border text-1.5xl " +
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
          elementType={elementType}
          onClickBack={onClickBack}
          onClickNext={onClickNext}
        />

        <p className={`text-lg font-semibold text-${elementType} text-center`}>{talent.name}</p>
        {renderTabs("my-2", [false, isPassiveTalent])}

        {activeIndex ? (
          <div>
            <div className="py-2 flex-center bg-surface-1 sticky -top-1">
              {levelable ? (
                <div className="flex items-center space-x-4">
                  {renderLevelButton(false, talentLevel <= 1)}
                  <label className="flex items-center text-lg">
                    <p>Lv.</p>
                    <select
                      className="font-bold text-right text-last-right"
                      value={talentLevel}
                      onChange={(e) => setTalentLevel(+e.target.value)}
                    >
                      {Array.from({ length: 15 }).map((_, i) => (
                        <option key={i}>{i + 1}</option>
                      ))}
                    </select>
                  </label>
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
            {isError && <Dim>Error. Rebooting...</Dim>}
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

type ProcessedTalentType = Talent | "A1" | "A4" | "utility";

interface ProcessedTalent {
  name: string;
  label: string;
  type: ProcessedTalentType;
  stats: ProcessedStat[];
}
function processTalents(appChar: AppCharacter, level: number, translate: (word: string) => string): ProcessedTalent[] {
  const { NAs, ES, EB, altSprint } = appChar.activeTalents;

  const result: ProcessedTalent[] = [
    { name: NAs.name, type: "NAs", label: translate("NAs"), stats: [] },
    { name: ES.name, type: "ES", label: translate("ES"), stats: [] },
    { name: EB.name, type: "EB", label: translate("EB"), stats: [] },
  ];

  for (const attPatt of ATTACK_PATTERNS) {
    const resultKey = attPatt === "ES" || attPatt === "EB" ? attPatt : "NAs";
    const talent = result.find((item) => item.type === resultKey);
    if (!talent) continue;

    const defaultInfo = Character_.getTalentDefaultInfo(
      resultKey,
      appChar.weaponType,
      appChar.vision,
      attPatt,
      appChar.multFactorConf
    );

    for (const stat of appChar.calcList[attPatt]) {
      const multFactors = toArray(stat.multFactors);
      const { flatFactor } = stat;
      const factorStrings = [];

      if (stat.notOfficial || multFactors.some((factor) => typeof factor !== "number" && factor.scale === 0)) {
        continue;
      }

      for (const factor of multFactors) {
        const {
          root,
          scale = defaultInfo.scale,
          basedOn = defaultInfo.basedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        if (scale && root) {
          let string = round(root * Character_.getTalentMult(scale, level), 2) + "%";

          if (basedOn) {
            string += ` ${translate(basedOn)}`;
          }

          factorStrings.push(string);
        }
      }

      if (flatFactor) {
        const { root, scale = defaultInfo.flatFactorScale } =
          typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;

        factorStrings.push(Math.round(root * (scale ? Character_.getTalentMult(scale, level) : 1)));
      }

      talent.stats.push({
        name: stat.name,
        value: factorStrings.join(" + "),
      });
    }
  }

  result[2].stats.push({
    name: "Energy cost",
    value: appChar.EBcost,
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
    ...appChar.passiveTalents.map<ProcessedTalent>((talent, i) => {
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
