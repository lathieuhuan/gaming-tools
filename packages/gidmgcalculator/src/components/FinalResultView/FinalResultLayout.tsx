import { useMemo, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Button, CollapseSpace, Table } from "rond";

import type { Character, Party, Weapon } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppCharacter, $AppData } from "@Src/services";
import { Character_ } from "@Src/utils";
import { displayValue, getTableKeys, type TableKey } from "./FinalResultView.utils";

type HeaderConfig = null | {
  className?: string;
  text: string;
};

type RowCellConfig = {
  className?: string;
  style?: React.CSSProperties;
  value: number | number[];
  extra?: React.ReactNode;
};

type RowConfig = {
  element?: string;
  cells: RowCellConfig[];
};

export interface FinalResultLayoutProps {
  char: Character;
  weapon: Weapon;
  party: Party;
  showWeaponCalc?: boolean;
  headerConfigs: HeaderConfig[];
  getRowConfig: (mainKey: TableKey["main"], subKey: string) => RowConfig;
  talentMutable?: boolean;
  onChangeTalentLevel?: (talentType: "NAs" | "ES" | "EB", newLevel: number) => void;
}
export function FinalResultLayout({
  char,
  weapon,
  party,
  showWeaponCalc,
  headerConfigs,
  getRowConfig,
  talentMutable,
  onChangeTalentLevel,
}: FinalResultLayoutProps) {
  const { t } = useTranslation();
  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppData.getWeapon(weapon.code);

  const [closedSections, setClosedSections] = useState<boolean[]>([]);
  const [lvlingSectionI, setLvlingSectionI] = useState(-1);

  const tableKeys = useMemo(() => {
    return getTableKeys(appChar, showWeaponCalc ? appWeapon : undefined);
  }, [char.name, appWeapon?.code, showWeaponCalc]);

  if (!appChar) return null;

  const toggleSection = (index: number) => {
    const newClosed = !closedSections[index];

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

  const renderLvButtons = (key: TableKey["main"], buffer = 0) => {
    return Array.from({ length: 5 }, (_, i) => {
      const level = i + 1 + buffer;
      const isTalent = key !== "RXN" && key !== "WP_CALC";

      return (
        <Button
          key={i}
          size="custom"
          className="w-8 h-8"
          disabled={!isTalent || char[key] === level}
          onClick={() => {
            if (isTalent) {
              onChangeTalentLevel?.(key, level);
              setLvlingSectionI(-1);
            }
          }}
        >
          {level}
        </Button>
      );
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      {tableKeys.map((tableKey, index) => {
        const isReactionDmg = tableKey.main === "RXN";
        const isLvling = index === lvlingSectionI;
        const talentLevel =
          !isReactionDmg && tableKey.main !== "WP_CALC"
            ? Character_.getFinalTalentLv({
                char,
                appChar,
                talentType: tableKey.main,
                partyData: $AppCharacter.getPartyData(party),
              })
            : 0;

        return (
          <div key={tableKey.main} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                className="pl-2 pr-3 text-base text-black bg-heading-color leading-none font-bold flex items-center gap-2 rounded-2xl overflow-hidden"
                onClick={() => toggleSection(index)}
              >
                <div className="py-1.5 flex items-center gap-1">
                  <FaCaretRight
                    className={"text-base duration-150 ease-linear" + (closedSections[index] ? "" : " rotate-90")}
                  />
                  <span>{tableKey.main === "WP_CALC" ? "Weapon" : t(tableKey.main)}</span>
                </div>

                {talentLevel ? (
                  <span className="px-1 rounded-sm bg-black/60 text-light-default text-sm">{talentLevel}</span>
                ) : null}
              </button>

              {talentMutable && talentLevel ? (
                <Button
                  boneOnly
                  size="custom"
                  className={`w-7 h-7 text-lg ${isLvling ? "text-active-color" : "text-light-disabled"}`}
                  icon={<MdEdit />}
                  onClick={() => onRequestChangeLevel(index, isLvling)}
                />
              ) : null}
            </div>

            {isLvling ? (
              <div className="py-1">
                <div className="flex gap-3">{renderLvButtons(tableKey.main)}</div>
                <div className="flex gap-3 mt-3">{renderLvButtons(tableKey.main, 5)}</div>
              </div>
            ) : null}

            <CollapseSpace key={tableKey.main} active={!closedSections[index]}>
              {tableKey.subs.length === 0 ? (
                <div className="pb-2">
                  <p className="pt-2 pb-1 bg-surface-2 text-center text-hint-color">
                    This talent does not deal damage.
                  </p>
                </div>
              ) : (
                <div className="custom-scrollbar">
                  <Table
                    className="mb-2 w-full"
                    colAttrs={[
                      {
                        className: "w-34",
                        style: { width: "8.5rem", minWidth: "6rem" },
                      },
                    ]}
                  >
                    <Table.Tr>
                      <Table.Th className="sticky left-0 z-10" style={{ background: "inherit" }} />

                      {headerConfigs.map((config, i) => {
                        return (
                          <Table.Th key={i} className={config?.className}>
                            {config?.text}
                          </Table.Th>
                        );
                      })}
                    </Table.Tr>

                    {tableKey.subs.map((subKey) => {
                      const config = getRowConfig(tableKey.main, subKey);

                      return (
                        <Table.Tr key={subKey}>
                          <Table.Td
                            title={config.element}
                            className="sticky left-0 z-10"
                            style={{ background: "inherit" }}
                          >
                            {isReactionDmg ? t(subKey) : subKey}
                          </Table.Td>

                          {config.cells.map((cell, cellIndex) => {
                            return (
                              <Table.Td key={cellIndex} className={cell.className} style={cell.style}>
                                {displayValue(cell.value)}
                                {cell.extra}
                              </Table.Td>
                            );
                          })}
                        </Table.Tr>
                      );
                    })}
                  </Table>
                </div>
              )}
            </CollapseSpace>
          </div>
        );
      })}
    </div>
  );
}
