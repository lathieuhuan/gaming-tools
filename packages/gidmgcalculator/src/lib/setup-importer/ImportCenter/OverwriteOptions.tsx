import { FormEvent, useState } from "react";
import { clsx, Table } from "rond";

import type { RawCharacter, ITargetBasic } from "@/types";

import { useTranslation } from "@/hooks";
import { $AppCharacter } from "@/services";
import { OverwriteOption } from "./OverwriteOption";

export type OverwriteOptionsProps = {
  currentMain: RawCharacter;
  currentTarget: ITargetBasic;
  importedMain: RawCharacter;
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
    return Object.keys(object1).map((key) => {
      const value1 =
        object1?.[key] === undefined
          ? null
          : Array.isArray(object1[key]) && object1[key].length > 1
          ? `${object1[key].join(", ")}`
          : `${object1[key]}`;

      const value2 = object2?.[key] === undefined ? null : `${object2[key]}`;

      return (
        <Table.Tr key={key}>
          <Table.Td className={clsx("capitalize", value1 !== value2 && "text-danger-2")}>
            {t(key, { ns })}
          </Table.Td>

          {key === "code" ? (
            <Table.Td colSpan={2} style={{ textAlign: "center" }}>
              {$AppCharacter.get(currentMain.code)?.name}
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
