import { FormEvent, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Table, CollapseSpace, Checkbox } from "rond";

import type { Character, Target } from "@Src/types";
import { $AppSettings } from "@Src/services";
import { useTranslation } from "@Src/hooks";
import { useSelector } from "@Store/hooks";
import { selectCalcSetupsById, selectActiveId, selectTarget } from "@Store/calculator-slice";

export interface OverwriteOptionsProps {
  importedChar: Character;
  importedTarget: Target;
  askForCharacter: boolean;
  askForTarget: boolean;
  onDone: (data: { shouldOverwriteChar: boolean; shouldOverwriteTarget: boolean }) => void;
}
export function OverwriteOptions({
  importedChar,
  importedTarget,
  askForCharacter,
  askForTarget,
  onDone,
}: OverwriteOptionsProps) {
  const { t } = useTranslation();
  const setupsById = useSelector(selectCalcSetupsById);
  const activeId = useSelector(selectActiveId);
  const target = useSelector(selectTarget);

  const [expandedSection, setExpandedSection] = useState<"" | "char" | "target">("");

  const { char } = setupsById[activeId];
  const oldChar = {
    name: char.name,
    level: [char.level],
    NAs: [char.NAs],
    ES: [char.ES],
    EB: [char.EB],
    cons: [char.cons],
  };

  if ($AppSettings.get("charInfoIsSeparated")) {
    oldChar.level = Object.values(setupsById).map(({ char }) => char.level);
    oldChar.NAs = Object.values(setupsById).map(({ char }) => char.NAs);
    oldChar.ES = Object.values(setupsById).map(({ char }) => char.ES);
    oldChar.EB = Object.values(setupsById).map(({ char }) => char.EB);
    oldChar.cons = Object.values(setupsById).map(({ char }) => char.cons);
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onDone({
      shouldOverwriteChar: !!formData.get("shouldOverwriteChar"),
      shouldOverwriteTarget: !!formData.get("shouldOverwriteTarget"),
    });
  };

  const onClickSeeDetails = (section: typeof expandedSection) => {
    setExpandedSection(section === expandedSection ? "" : section);
  };

  const renderCompareRow = (object1: any, object2: any, ns: "resistance" | "common") => {
    return Object.keys(object1).map((type) => {
      const value1 =
        object1?.[type] === undefined
          ? null
          : Array.isArray(object1[type]) && object1[type].length > 1
          ? `${object1[type].join(", ")}`
          : `${object1[type]}`;

      const value2 = object2?.[type] === undefined ? null : `${object2[type]}`;

      return (
        <Table.Tr key={type}>
          <Table.Td className={"capitalize" + (value1 !== value2 ? " text-danger-3" : "")}>{t(type, { ns })}</Table.Td>
          {type === "name" ? (
            <Table.Td colSpan={2} style={{ textAlign: "center" }}>
              {oldChar.name}
            </Table.Td>
          ) : (
            <>
              <Table.Td>{value1}</Table.Td>
              <Table.Td>{value2}</Table.Td>
            </>
          )}
        </Table.Tr>
      );
    });
  };

  const oldTarget = { level: target?.level, ...target?.resistances };
  const newTarget = { level: importedTarget?.level, ...importedTarget?.resistances };

  return (
    <form id="overwrite-configuration" onSubmit={onSubmit}>
      <p className="text-base">
        We detect difference(s) between the Calculator and this Setup. Choose what you want to overwrite.
      </p>
      <div className="mt-4 space-y-4">
        <OverwriteOption
          visible={askForCharacter}
          label="Character's Info"
          name="shouldOverwriteChar"
          expanded={expandedSection === "char"}
          onClickSeeDetails={() => onClickSeeDetails("char")}
        >
          {renderCompareRow(oldChar, importedChar, "common")}
        </OverwriteOption>

        <OverwriteOption
          visible={askForTarget}
          label="Target's Info"
          name="shouldOverwriteTarget"
          expanded={expandedSection === "target"}
          onClickSeeDetails={() => onClickSeeDetails("target")}
        >
          {renderCompareRow(oldTarget, newTarget, "resistance")}
        </OverwriteOption>
      </div>
    </form>
  );
}

interface OverwriteOptionProps {
  visible: boolean;
  label: string;
  name: string;
  expanded: boolean;
  /** Compare rows */
  children: React.ReactNode;
  onClickSeeDetails: () => void;
}
function OverwriteOption({ visible, label, name, expanded, children, onClickSeeDetails }: OverwriteOptionProps) {
  if (!visible) return null;

  return (
    <div>
      <div className="px-4 flex items-center justify-between">
        <Checkbox className="mr-4" name={name}>
          {label}
        </Checkbox>

        <div className="flex items-center">
          <FaChevronRight className={"text-xs" + (expanded ? " rotate-90" : "")} />
          <span
            className={"ml-1 text-sm cursor-pointer " + (expanded ? "text-bonus-color" : "text-light-default")}
            onClick={onClickSeeDetails}
          >
            See details
          </span>
        </div>
      </div>

      <CollapseSpace active={expanded}>
        <div className="pt-2 flex justify-center">
          <div style={{ maxWidth: "18rem" }}>
            <Table>
              <Table.Tr>
                <Table.Th />
                <Table.Th className="text-primary-1">Old</Table.Th>
                <Table.Th className="text-primary-1">New</Table.Th>
              </Table.Tr>

              {children}
            </Table>
          </div>
        </div>
      </CollapseSpace>
    </div>
  );
}
