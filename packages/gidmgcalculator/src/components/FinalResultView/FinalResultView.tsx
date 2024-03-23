import { useMemo, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { CollapseSpace, Table } from "rond";

import type { Character, CalculationFinalResult, Party, CalculationAspect } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppCharacter } from "@Src/services";
import { Character_ } from "@Src/utils";
import { displayValue, getTableKeys } from "./FinalResultView.utils";

// Component
import { FinalResultCompare } from "./FinalResultCompare";

interface FinalResultViewProps {
  char: Character;
  party: Party;
  finalResult: CalculationFinalResult;
  talentMutable?: boolean;
  focusedAspect?: CalculationAspect;
  onChangeTalentLevel?: (newLevel: number) => void;
}
export function FinalResultView({
  char,
  party,
  finalResult,
  talentMutable,
  focusedAspect,
  onChangeTalentLevel,
}: FinalResultViewProps) {
  const { t } = useTranslation();
  const appChar = $AppCharacter.get(char.name);

  const [closedSections, setClosedSections] = useState<boolean[]>([]);
  // const [lvlingSectionIndex, setLvlingSectionIndex] = useState(-1);
  const tableKeys = useMemo(() => (appChar ? getTableKeys(appChar) : []), [char.name]);

  if (!appChar) return null;

  const toggleSection = (index: number) => {
    setClosedSections((prev) => Object.assign([...prev], { [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col space-y-2">
      {tableKeys.map((key, index) => {
        const standardValues = finalResult[key.main];
        const isReactionDmg = key.main === "RXN";
        const talentLevel = !isReactionDmg
          ? Character_.getFinalTalentLv({
              char,
              appChar,
              talentType: key.main,
              partyData: $AppCharacter.getPartyData(party),
            })
          : 0;
        // const isLvling = index === lvlingSectionIndex;

        return (
          <div key={key.main} className="flex flex-col">
            <button
              type="button"
              className="mx-auto mb-2 w-52 px-4 text-base text-black bg-orange-500 leading-none font-bold flex items-center justify-between rounded-2xl overflow-hidden"
            >
              <div className="grow py-1.5 flex items-center space-x-2" onClick={() => toggleSection(index)}>
                <FaChevronRight
                  className={"text-sm duration-150 ease-linear" + (closedSections[index] ? "" : " rotate-90")}
                />
                <span>{t(key.main)}</span>
              </div>

              {talentLevel ? (
                <span className="px-1 rounded-sm bg-black/60 text-light-400 text-sm">{talentLevel}</span>
              ) : null}
            </button>

            {/* <div className="mx-auto mb-2 w-52 text-base text-black leading-none font-bold flex rounded-2xl overflow-hidden">
              <button
                type="button"
                className="grow py-1.5 pl-4 flex items-center space-x-2 bg-mint-600 overflow-hidden"
                onClick={() => toggleSection(index)}
              >
                <FaChevronRight
                  className={"text-sm duration-150 ease-linear" + (closedSections[index] ? "" : " rotate-90")}
                />
                <span>{t(key.main)}</span>
              </button>

              {talentLevel ? (
                <button
                  type="button"
                  className="py-1.5 pl-2 pr-3 flex-center bg-light-400 glow-on-hover"
                  onClick={() => setLvlingSectionIndex(isLvling ? -1 : index)}
                >
                  {talentLevel}
                </button>
              ) : null}
            </div> */}

            <CollapseSpace active={!closedSections[index]}>
              {key.subs.length === 0 ? (
                <div className="pb-2">
                  <p className="pt-2 pb-1 bg-dark-700 text-center text-light-800">This talent does not deal damage.</p>
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
                      null,
                      null,
                      null,
                    ]}
                  >
                    {focusedAspect ? (
                      <FinalResultCompare focusedAspect={focusedAspect} tableKey={key} />
                    ) : (
                      <>
                        <Table.Tr>
                          <Table.Th />
                          <Table.Th>Non-crit</Table.Th>
                          <Table.Th>Crit</Table.Th>
                          <Table.Th className="text-yellow-400">Avg.</Table.Th>
                        </Table.Tr>

                        {key.subs.map((subKey) => {
                          const value = standardValues[subKey];

                          return (
                            <Table.Tr key={subKey}>
                              <Table.Td title={value.attElmt}>{isReactionDmg ? t(subKey) : subKey}</Table.Td>
                              <Table.Td>{displayValue(value.nonCrit)}</Table.Td>
                              <Table.Td>{displayValue(value.crit)}</Table.Td>
                              <Table.Td className="text-yellow-400">{displayValue(value.average)}</Table.Td>
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
