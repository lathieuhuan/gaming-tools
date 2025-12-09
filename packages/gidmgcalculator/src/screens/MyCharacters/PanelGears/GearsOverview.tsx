import { FaInfo } from "react-icons/fa";
import { Button, CloseButton, clsx } from "rond";

import type { ArtifactType, IArtifactGearSet } from "@/types";
import type { GearsDetailType } from "./Gears.types";

import { EquipmentDisplay, EquipmentDisplayProps, EquipmentType } from "@/components";
import { ARTIFACT_TYPES } from "@/constants";
import { useActiveChar } from "../ActiveCharProvider";

const bonusStyles = (active: boolean) => {
  return ["p-2 flex justify-between items-center rounded-lg group", active && "bg-dark-2"];
};

export type GearsOverviewProps = {
  className?: string;
  style?: React.CSSProperties;
  detailType: GearsDetailType;
  onClickDetail: (newDetailsType: GearsDetailType) => void;
  onClickEmptyAtfSlot: EquipmentDisplayProps["onClickEmptyAtfSlot"];
};

export function GearsOverview({
  className,
  style,
  detailType,
  onClickDetail,
  onClickEmptyAtfSlot,
}: GearsOverviewProps) {
  const { weapon, artifact } = useActiveChar();
  const atfGearSets = artifact.sets;

  const renderSet = (set?: IArtifactGearSet) => {
    return (
      set && (
        <p className="text-bonus font-medium">
          {set.data.name} ({set.pieceCount})
        </p>
      )
    );
  };

  const isEquipmentType = (type: GearsDetailType): type is EquipmentType => {
    return type === "weapon" || ARTIFACT_TYPES.includes(type as ArtifactType);
  };

  return (
    <div className={className} style={style}>
      <EquipmentDisplay
        fillable
        showOwner={false}
        selectedType={isEquipmentType(detailType) ? detailType : undefined}
        weapon={weapon}
        atfSlots={artifact.slots}
        onClickItem={onClickDetail}
        onClickEmptyAtfSlot={onClickEmptyAtfSlot}
      />

      <div
        className={clsx("mt-3", bonusStyles(detailType === "setBonus"))}
        onClick={() => {
          if (atfGearSets.length) onClickDetail("setBonus");
        }}
      >
        <div>
          <p className="text-lg text-heading font-semibold">Set bonus</p>
          <div className="mt-1 pl-2">
            {atfGearSets.length ? (
              <>
                {renderSet(atfGearSets[0])}
                {renderSet(atfGearSets[1])}
              </>
            ) : (
              <p className="text-light-hint font-semibold">No Set bonus</p>
            )}
          </div>
        </div>

        {atfGearSets.length !== 0 ? (
          detailType === "setBonus" ? (
            <CloseButton className="ml-auto" size="small" />
          ) : (
            <Button className="ml-auto group-hover:bg-primary-1" size="small" icon={<FaInfo />} />
          )
        ) : null}
      </div>

      <div
        className={clsx("mt-2", bonusStyles(detailType === "statsBonus"))}
        onClick={() => onClickDetail("statsBonus")}
      >
        <p className="text-lg text-heading font-semibold">Artifact details</p>

        {detailType === "statsBonus" ? (
          <CloseButton className="ml-auto" size="small" />
        ) : (
          <Button className="ml-auto group-hover:bg-primary-1" size="small" icon={<FaInfo />} />
        )}
      </div>
    </div>
  );
}
