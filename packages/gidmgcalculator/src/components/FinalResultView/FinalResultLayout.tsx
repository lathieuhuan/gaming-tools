import { useMemo, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Button, CollapseSpace, Table, TableThProps } from "rond";

import type { AppCharacter, CalcCharacter, Talent, Weapon } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppData } from "@Src/services";
import { displayValue, getTableKeys, type TableKey } from "./FinalResultView.utils";

type ToggleLvling = (active: boolean) => void;

type HeaderConfig = Pick<TableThProps, "className" | "style"> & {
  content: React.ReactNode | ((talentType: Talent | undefined) => React.ReactNode);
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
  char: CalcCharacter;
  appChar: AppCharacter;
  weapon: Weapon;
  showWeaponCalc?: boolean;
  headerConfigs: HeaderConfig[];
  getRowConfig: (mainKey: TableKey["main"], subKey: string) => RowConfig;
  getTalentLevel?: (talentType: Talent) => number | undefined;
  talentMutable?: boolean;
  onChangeTalentLevel?: (talentType: "NAs" | "ES" | "EB", newLevel: number) => void;
}
export function FinalResultLayout({
  char,
  appChar,
  weapon,
  showWeaponCalc,
  talentMutable,
  getTalentLevel,
  onChangeTalentLevel,
  ...sectionProps
}: FinalResultLayoutProps) {
  const { t } = useTranslation();
  const appWeapon = $AppData.getWeapon(weapon.code);

  const [closedSections, setClosedSections] = useState<boolean[]>([]);
  const [lvlingSectionI, setLvlingSectionI] = useState(-1);

  const tableKeys = useMemo(() => {
    return getTableKeys(appChar, showWeaponCalc ? appWeapon : undefined);
  }, [char.name, appWeapon?.code, showWeaponCalc]);

  if (!appChar) return null;

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
    <div className="flex flex-col gap-4">
      {tableKeys.map((tableKey, sectionIndex) => {
        const mainKey = tableKey.main;
        const isReactionDmg = mainKey === "RXN";
        const isLvling = sectionIndex === lvlingSectionI;
        const talentType = !isReactionDmg && mainKey !== "WP_CALC" ? mainKey : undefined;
        const talentLevel = talentType ? getTalentLevel?.(talentType) : 0;

        return (
          <div key={tableKey.main}>
            <div className="flex gap-3">
              <button
                type="button"
                className="pl-2 pr-3 text-base text-black bg-heading-color leading-none font-bold flex items-center gap-2 rounded-2xl overflow-hidden"
                onClick={() => toggleSection(sectionIndex)}
              >
                <div className="py-1.5 flex items-center gap-1">
                  <FaCaretRight
                    className={
                      "text-base duration-150 ease-linear" + (closedSections[sectionIndex] ? "" : " rotate-90")
                    }
                  />
                  <span>{tableKey.main === "WP_CALC" ? "Weapon" : t(tableKey.main)}</span>
                </div>

                {talentLevel ? (
                  <span className="px-1 rounded-sm bg-black/60 text-light-default text-sm">{talentLevel}</span>
                ) : null}
              </button>

              <div className="flex">
                {talentMutable && talentLevel ? (
                  <Button
                    boneOnly
                    size="custom"
                    className={`w-7 h-7 text-lg ${isLvling ? "text-active-color" : "text-light-disabled"}`}
                    icon={<MdEdit />}
                    onClick={() => onRequestChangeLevel(sectionIndex, isLvling)}
                  />
                ) : null}
              </div>
            </div>

            {isLvling ? (
              <div className="mt-2">
                <div className="text-sm">Select level</div>
                <div className="mt-1 flex gap-3">{renderLvButtons(tableKey.main)}</div>
                <div className="mt-3 flex gap-3">{renderLvButtons(tableKey.main, 5)}</div>
              </div>
            ) : null}

            <CollapseSpace key={tableKey.main} active={!closedSections[sectionIndex]}>
              {tableKey.subs.length === 0 ? (
                <div className="pb-2">
                  <p className="pt-2 pb-1 bg-surface-2 text-center text-hint-color">
                    This talent does not deal damage.
                  </p>
                </div>
              ) : (
                <div className="pt-2 custom-scrollbar">
                  <SectionTable
                    tableKey={tableKey}
                    talentType={talentType}
                    getRowTitle={(subKey) => (isReactionDmg ? t(subKey) : subKey)}
                    {...sectionProps}
                  />
                </div>
              )}
            </CollapseSpace>
          </div>
        );
      })}
    </div>
  );
}

interface SectionTableProps extends Pick<FinalResultLayoutProps, "getRowConfig" | "headerConfigs"> {
  tableKey: TableKey;
  talentType?: Talent;
  getRowTitle: (key: string) => string;
}
function SectionTable(props: SectionTableProps) {
  return (
    <Table
      className="w-full"
      colAttrs={[
        {
          className: "w-34",
          style: { width: "8.5rem", minWidth: "6rem" },
        },
      ]}
    >
      <Table.Tr>
        <Table.Th className="sticky left-0 z-10" style={{ background: "inherit" }} />

        {props.headerConfigs.map(({ content, ...attrs }, i) => {
          return (
            <Table.Th key={i} {...attrs}>
              {typeof content === "function" ? content(props.talentType) : content}
            </Table.Th>
          );
        })}
      </Table.Tr>

      {props.tableKey.subs.map((subKey) => {
        const config = props.getRowConfig(props.tableKey.main, subKey);

        return (
          <Table.Tr key={subKey}>
            <Table.Td title={config.element} className="sticky left-0 z-10" style={{ background: "inherit" }}>
              {props.getRowTitle(subKey)}
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
  );
}
