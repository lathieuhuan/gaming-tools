import { useMemo, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { CollapseSpace, Table, TableThProps, TableTrProps } from "rond";

import type { Character, CalculationFinalResult, Party, CalculationAspect, Weapon } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppCharacter, $AppData } from "@Src/services";
import { Character_ } from "@Src/utils";
import { displayValue, getTableKeys } from "./FinalResultView.utils";

// Component
import { ResultSectionCompare } from "./ResultSectionCompare";

type SectionConfig = {};

interface FinalResultLayoutProps {
  char: Character;
  weapon: Weapon;
  party: Party;
  finalResult: CalculationFinalResult;
  headerConfigs: TableThProps[];
}
export function FinalResultLayout({ char, weapon, party, finalResult, headerConfigs }: FinalResultLayoutProps) {
  const { t } = useTranslation();
  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppData.getWeapon(weapon.code);

  const [closedSections, setClosedSections] = useState<boolean[]>([]);
  const tableKeys = useMemo(() => (appChar ? getTableKeys(appChar, appWeapon) : []), [char.name, appWeapon.code]);

  if (!appChar) return null;

  const toggleSection = (index: number) => {
    setClosedSections((prev) => Object.assign([...prev], { [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col space-y-2">
      {tableKeys.map((tableKey, index) => {
        const standardValues = finalResult[tableKey.main];
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
                <span>{t(tableKey.main)}</span>
              </div>

              {talentLevel ? (
                <span className="px-1 rounded-sm bg-black/60 text-light-default text-sm">{talentLevel}</span>
              ) : null}
            </button>

            <CollapseSpace active={!closedSections[index]}>
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
                        style: { width: "8.5rem" },
                      },
                    ]}
                  >
                    {focusedAspect ? (
                      <ResultSectionCompare
                        focusedAspect={focusedAspect}
                        tableKey={tableKey}
                        labelTranslate={isReactionDmg ? t : undefined}
                      />
                    ) : (
                      <>
                        <Table.Tr>
                          {headerConfigs.map((config, i) => {
                            return <Table.Th key={i} {...config} />;
                          })}
                        </Table.Tr>

                        {tableKey.subs.map((subKey) => {
                          const value = standardValues[subKey];

                          return (
                            <Table.Tr key={subKey}>
                              <Table.Td title={value.attElmt}>{isReactionDmg ? t(subKey) : subKey}</Table.Td>
                              <Table.Td>{displayValue(value.nonCrit)}</Table.Td>
                              <Table.Td>{displayValue(value.crit)}</Table.Td>
                              <Table.Td className="text-primary-1">{displayValue(value.average)}</Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </>
                    )}
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
