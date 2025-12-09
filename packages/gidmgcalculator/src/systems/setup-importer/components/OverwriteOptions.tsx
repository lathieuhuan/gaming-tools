import { FormEvent, useState } from "react";
import { clsx, Table } from "rond";

import type { ICharacterBasic, ITargetBasic } from "@/types";

import { useTranslation } from "@/hooks";
import { OverwriteOption } from "./OverwriteOption";

export type OverwriteOptionsProps = {
  currentMain: ICharacterBasic;
  currentTarget: ITargetBasic;
  importedMain: ICharacterBasic;
  importedTarget: ITargetBasic;
  askForCharacter: boolean;
  askForTarget: boolean;
  onDone: (options: { overwriteChar: boolean; overwriteTarget: boolean }) => void;
};

export function OverwriteOptions({
  currentMain,
  currentTarget,
  importedMain,
  importedTarget,
  askForCharacter,
  askForTarget,
  onDone,
}: OverwriteOptionsProps) {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<"" | "char" | "target">("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onDone({
      overwriteChar: !!formData.get("overwriteChar"),
      overwriteTarget: !!formData.get("overwriteTarget"),
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
          <Table.Td className={clsx("capitalize", value1 !== value2 && "text-danger-2")}>
            {t(type, { ns })}
          </Table.Td>

          {type === "name" ? (
            <Table.Td colSpan={2} style={{ textAlign: "center" }}>
              {currentMain.name}
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

  return (
    <form id="overwrite-configuration" onSubmit={onSubmit}>
      <p className="text-base">
        We detect difference(s) between the Calculator and this Setup. Choose what you want to
        overwrite.
      </p>
      <div className="mt-4 space-y-4">
        <OverwriteOption
          visible={askForCharacter}
          label="Character's Info"
          name="overwriteChar"
          expanded={expandedSection === "char"}
          onClickSeeDetails={() => onClickSeeDetails("char")}
        >
          {renderCompareRow(currentMain, importedMain, "common")}
        </OverwriteOption>

        <OverwriteOption
          visible={askForTarget}
          label="Target's Info"
          name="overwriteTarget"
          expanded={expandedSection === "target"}
          onClickSeeDetails={() => onClickSeeDetails("target")}
        >
          {renderCompareRow(currentTarget, importedTarget, "resistance")}
        </OverwriteOption>
      </div>
    </form>
  );
}
