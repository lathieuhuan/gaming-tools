import { FormEvent, useState } from "react";
import { Table } from "rond";

import { useTranslation } from "@Src/hooks";
import { $AppSettings } from "@Src/services";
import type { Character, Target } from "@Src/types";
import { selectActiveId, selectCalcSetupsById, selectTarget } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";

import { OverwriteOption } from "./OverwriteOption";

export type OverwriteOptionsProps = {
  importedChar: Character;
  importedTarget: Target;
  askForCharacter: boolean;
  askForTarget: boolean;
  onDone: (data: { shouldOverwriteChar: boolean; shouldOverwriteTarget: boolean }) => void;
};

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

  if ($AppSettings.get("isCharInfoSeparated")) {
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
