import { useMemo, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { CollapseSpace, Table } from "rond";

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
}
export function FinalResultLayout({
  char,
  weapon,
  party,
  showWeaponCalc,
  headerConfigs,
  getRowConfig,
}: FinalResultLayoutProps) {
  const { t } = useTranslation();
  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppData.getWeapon(weapon.code);

  const [closedSections, setClosedSections] = useState<boolean[]>([]);

  const tableKeys = useMemo(() => {
    return getTableKeys(appChar, showWeaponCalc ? appWeapon : undefined);
  }, [char.name, appWeapon?.code, showWeaponCalc]);

  if (!appChar) return null;

  const toggleSection = (index: number) => {
    setClosedSections((prev) => Object.assign([...prev], { [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col space-y-2">
      {tableKeys.map((tableKey, index) => {
        const isReactionDmg = tableKey.main === "RXN";
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
          <div key={tableKey.main} className="flex flex-col">
            <button
              type="button"
              className="mx-auto mb-2 w-52 px-4 text-base text-black bg-heading-color leading-none font-bold flex items-center justify-between rounded-2xl overflow-hidden"
            >
              <div className="grow py-1.5 flex items-center space-x-2" onClick={() => toggleSection(index)}>
                <FaChevronRight
                  className={"text-sm duration-150 ease-linear" + (closedSections[index] ? "" : " rotate-90")}
                />
                <span>{tableKey.main === "WP_CALC" ? "Weapon" : t(tableKey.main)}</span>
              </div>

              {talentLevel ? (
                <span className="px-1 rounded-sm bg-black/60 text-light-default text-sm">{talentLevel}</span>
              ) : null}
            </button>

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
