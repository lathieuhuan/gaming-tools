import { useMemo, useState } from "react";
import { CollapseSpace } from "rond";

import type { Character } from "@/models";
import type { LevelableTalentType } from "@/types";

import { useTranslation } from "@/hooks";
import { SectionHeader } from "./SectionHeader";
import { SectionTable } from "./SectionTable";
import { TalentSection } from "./TalentSection";
import { GetRowConfig, HeaderConfig } from "./types";
import { getTableKeys } from "./utils";

export type FinalResultLayoutProps = {
  character: Character;
  /** Default true */
  showTalentLv?: boolean;
  showWeaponCalc?: boolean;
  headerConfigs: HeaderConfig[];
  talentMutable?: boolean;
  extraKeys?: string[];
  getRowConfig: GetRowConfig;
  onTalentLevelChange?: (talentType: LevelableTalentType, newLevel: number) => void;
};

export function FinalResultLayout({
  character,
  showTalentLv = true,
  showWeaponCalc,
  talentMutable,
  extraKeys,
  onTalentLevelChange,
  ...sectionProps
}: FinalResultLayoutProps) {
  const { t } = useTranslation();

  const [closedSections, setClosedSections] = useState<boolean[]>([]);
  const [lvlingSectionI, setLvlingSectionI] = useState(-1);

  const tableKeys = useMemo(() => {
    return getTableKeys(
      character.data.calcList,
      showWeaponCalc ? character.weapon.data.calcItems : undefined,
      extraKeys
    );
  }, [character.code, character.weapon.code, showWeaponCalc, extraKeys]);

  const toggleSection = (index: number, forcedClosed?: boolean) => {
    const newClosed = forcedClosed ?? !closedSections[index];

    setClosedSections(Object.assign([...closedSections], { [index]: newClosed }));

    if (newClosed && index === lvlingSectionI) {
      setLvlingSectionI(-1);
    }
  };

  const onRequestChangeLevel = (index: number, isLvling: boolean) => {
    setLvlingSectionI(isLvling ? -1 : index);

    if (!isLvling && closedSections[index]) {
      toggleSection(index);
    }
  };

  const labelByMainKey = {
    WP: "Weapon",
    RXN: "Reaction",
    XTRA: "Extra",
  };

  return (
    <div className="flex flex-col gap-4">
      {tableKeys.map((tableKey, sectionIndex) => {
        switch (tableKey.main) {
          case "WP":
          case "RXN":
          case "XTRA": {
            const isReactionDmg = tableKey.main === "RXN";
            const sectionLabel = labelByMainKey[tableKey.main];

            if (tableKey.subs.length === 0) {
              return null;
            }

            return (
              <div key={tableKey.main}>
                <SectionHeader
                  title={sectionLabel}
                  open={!closedSections[sectionIndex]}
                  onClickTitle={() => toggleSection(sectionIndex)}
                />

                <CollapseSpace active={!closedSections[sectionIndex]}>
                  <div className="pt-2 custom-scrollbar">
                    <SectionTable
                      tableKey={tableKey}
                      label={sectionLabel}
                      getRowTitle={(subKey) => (isReactionDmg ? t(subKey) : subKey)}
                      {...sectionProps}
                    />
                  </div>
                </CollapseSpace>
              </div>
            );
          }
          default: {
            const isLvling = sectionIndex === lvlingSectionI;
            const talentLevel = showTalentLv
              ? character.getFinalTalentLv(tableKey.main)
              : undefined;

            return (
              <TalentSection
                key={tableKey.main}
                tableKey={tableKey}
                open={!closedSections[sectionIndex]}
                level={talentLevel}
                talentMutable={talentMutable}
                isLvling={isLvling}
                onRequestChangeLevel={() => onRequestChangeLevel(sectionIndex, isLvling)}
                onToggle={() => toggleSection(sectionIndex)}
                onLevelChange={(talent, level) => {
                  onTalentLevelChange?.(talent, level);
                  setLvlingSectionI(-1);
                }}
                {...sectionProps}
              />
            );
          }
        }
      })}
    </div>
  );
}
