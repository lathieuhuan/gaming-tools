import { FaInfo } from "react-icons/fa";
import { clsx, Button, CloseButton, ItemCase } from "rond";

import type { GearsDetailType } from "./Gears.types";
import { ARTIFACT_TYPES } from "@Src/constants";
import { $AppData } from "@Src/services";
import { Artifact_ } from "@Src/utils";
import { GenshinImage, ItemThumbnail } from "@Src/components";
import { useCharacterInfo } from "../CharacterInfoProvider";

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
  const { loading, data } = useCharacterInfo();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) return null;
  const { appWeapon, setBonuses } = data;

  return (
    <div className={className} style={style}>
      <div className="flex flex-wrap">
        <div className="p-1 w-1/3">
          <ItemCase chosen={detailType === "weapon"} onClick={() => onClickDetail("weapon")}>
            {(className, imgCls) => (
              <ItemThumbnail
                className={className}
                imgCls={imgCls}
                item={{
                  beta: appWeapon.beta,
                  icon: appWeapon.icon,
                  rarity: appWeapon.rarity,
                  ...data.weapon,
                  owner: undefined,
                }}
              />
            )}
          </ItemCase>
        </div>

        {data.artifacts.map((artifact, i) =>
          artifact ? (
            <div key={i} className="p-1 w-1/3">
              <ItemCase chosen={detailType === i} onClick={() => onClickDetail(i)}>
                {(className) => (
                  <ItemThumbnail
                    className={className}
                    item={{
                      rarity: artifact.rarity,
                      level: artifact.level,
                      icon: $AppData.getArtifact(artifact)?.icon || "",
                      setupIDs: artifact.setupIDs,
                    }}
                  />
                )}
              </ItemCase>
            </div>
          ) : (
            <div key={i} className="p-1 w-1/3" style={{ minHeight: 124 }}>
              <button
                className="p-4 w-full h-full flex-center rounded bg-surface-3 glow-on-hover"
                onClick={() => onClickEmptyArtifact(i)}
              >
                <GenshinImage className="w-full" src={Artifact_.iconOf(ARTIFACT_TYPES[i])} />
              </button>
            </div>
          )
        )}
      </div>

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
                  {$AppData.getArtifactSet(setBonuses[0].code)?.name} ({setBonuses[0].bonusLv * 2 + 2})
                </p>
                {setBonuses[1] ? (
                  <p className="mt-1 text-bonus-color font-medium">
                    {$AppData.getArtifactSet(setBonuses[1].code)?.name} (2)
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
