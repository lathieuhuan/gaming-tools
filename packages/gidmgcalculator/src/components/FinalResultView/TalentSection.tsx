import { Button, CollapseSpace } from "rond";
import { SectionHeader } from "./SectionHeader";
import { SectionTable, SectionTableProps } from "./SectionTable";
import { TableCalcItemKey } from "./utils";
import { useTranslation } from "@/hooks";
import { MdEdit } from "react-icons/md";
import { LevelableTalentType } from "@/types";

type TalentSectionProps = Pick<SectionTableProps, "headerConfigs" | "getRowConfig"> & {
  tableKey: TableCalcItemKey;
  open: boolean;
  level?: number;
  talentMutable?: boolean;
  isLvling: boolean;
  onRequestChangeLevel: () => void;
  onToggle: () => void;
  onLevelChange: (talent: LevelableTalentType, level: number) => void;
};

export function TalentSection({
  tableKey,
  open,
  level,
  talentMutable,
  isLvling,
  onRequestChangeLevel,
  onToggle,
  onLevelChange,
  ...sectionProps
}: TalentSectionProps) {
  const { t } = useTranslation();
  const title = t(tableKey.main);
  const talentType = tableKey.main;

  const renderLvButtons = (talent: LevelableTalentType, buffer = 0) => {
    return Array.from({ length: 5 }, (_, i) => {
      const level = i + 1 + buffer;

      return (
        <Button
          key={i}
          size="custom"
          className="w-8 h-8"
          onClick={() => {
            onLevelChange?.(talent, level);
          }}
        >
          {level}
        </Button>
      );
    });
  };

  return (
    <div>
      <SectionHeader
        title={title}
        open={open}
        level={level}
        extra={
          talentMutable && talentType ? (
            <Button
              boneOnly
              size="custom"
              className={`w-7 h-7 text-lg ${isLvling ? "text-active" : "text-light-4"}`}
              icon={<MdEdit />}
              onClick={() => onRequestChangeLevel()}
            />
          ) : null
        }
        onClickTitle={onToggle}
      />

      {isLvling && talentType ? (
        <div className="mt-2">
          <div className="text-sm">Select level</div>
          <div className="mt-1 flex gap-3">{renderLvButtons(talentType)}</div>
          <div className="mt-3 flex gap-3">{renderLvButtons(talentType, 5)}</div>
        </div>
      ) : null}

      <CollapseSpace active={open}>
        {tableKey.subs.length === 0 ? (
          <div className="pt-2">
            <p className="pt-2 pb-1 bg-dark-2 text-center text-light-hint">
              This talent does not deal damage.
            </p>
          </div>
        ) : (
          <div className="pt-2 custom-scrollbar">
            <SectionTable
              tableKey={tableKey}
              talentType={talentType}
              getRowTitle={(subKey) => subKey}
              {...sectionProps}
              label={title}
            />
          </div>
        )}
      </CollapseSpace>
    </div>
  );
}
