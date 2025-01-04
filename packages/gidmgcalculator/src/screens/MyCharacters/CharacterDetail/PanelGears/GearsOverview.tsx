import { FaInfo } from "react-icons/fa";
import { clsx, Button, CloseButton, LoadingSpin } from "rond";

import type { GearsDetailType } from "./Gears.types";
import { $AppArtifact } from "@Src/services";
import { EquipmentDisplay } from "@Src/components";
import { useDetailInfo } from "../ContextProvider";

const bonusStyles = (active: boolean) => {
  return ["p-2 flex justify-between items-center rounded-lg group", active && "bg-surface-2"];
};

export interface GearsOverviewProps {
  className?: string;
  style?: React.CSSProperties;
  detailType: GearsDetailType;
  onClickDetail: (newDetailsType: GearsDetailType) => void;
  onClickEmptyArtifact: (artifactIndex: number) => void;
}
export function GearsOverview({
  className,
  style,
  detailType,
  onClickDetail,
  onClickEmptyArtifact,
}: GearsOverviewProps) {
  const data = useDetailInfo();

  if (!data) {
    return (
      <div className="h-full flex-center">
        <LoadingSpin size="large" />
      </div>
    );
  }
  const { appWeapon, setBonuses } = data;

  return (
    <div className={className} style={style}>
      <EquipmentDisplay
        fillable
        showOwner={false}
        selectedIndex={detailType === "weapon" ? 5 : typeof detailType === "number" ? detailType : -1}
        weapon={data.weapon}
        appWeapon={appWeapon}
        artifacts={data.artifacts}
        onClickItem={(index) => onClickDetail(index === 5 ? "weapon" : index)}
        onClickEmptyArtifact={onClickEmptyArtifact}
      />

      <div
        className={clsx("mt-3", bonusStyles(detailType === "setBonus"))}
        onClick={() => {
          if (setBonuses.length) onClickDetail("setBonus");
        }}
      >
        <div>
          <p className="text-lg text-heading-color font-semibold">Set bonus</p>
          <div className="mt-1 pl-2">
            {setBonuses.length ? (
              <>
                <p className="text-bonus-color font-medium">
                  {$AppArtifact.getSet(setBonuses[0].code)?.name} ({setBonuses[0].bonusLv * 2 + 2})
                </p>
                {setBonuses[1] ? (
                  <p className="mt-1 text-bonus-color font-medium">
                    {$AppArtifact.getSet(setBonuses[1].code)?.name} (2)
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-hint-color font-semibold">No Set bonus</p>
            )}
          </div>
        </div>

        {setBonuses.length !== 0 ? (
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
        <p className="text-lg text-heading-color font-semibold">Artifact details</p>

        {detailType === "statsBonus" ? (
          <CloseButton className="ml-auto" size="small" />
        ) : (
          <Button className="ml-auto group-hover:bg-primary-1" size="small" icon={<FaInfo />} />
        )}
      </div>
    </div>
  );
}
