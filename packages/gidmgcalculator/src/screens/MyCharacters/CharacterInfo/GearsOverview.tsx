import { FaInfo } from "react-icons/fa";
import { clsx, Button, CloseButton, ItemCase } from "rond";

import type { ArtifactSetBonus, UserArtifacts, UserWeapon } from "@Src/types";
import type { GearsDetailType } from "./CharacterInfo.types";
import { ARTIFACT_TYPES } from "@Src/constants";
import { $AppData } from "@Src/services";
import { Artifact_ } from "@Src/utils";
import { GenshinImage, ItemThumbnail } from "@Src/components";

const bonusStyles = (active: boolean) => {
  return ["p-2 flex justify-between items-center rounded-lg group", active && "bg-surface-2"];
};

interface GearsOverviewProps {
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  activeDetails: GearsDetailType;
  toggleDetails: (newDetailsType: GearsDetailType) => void;
  onClickEmptyArtIcon: (artifactIndex: number) => void;
}
export function GearsOverview({
  weapon,
  artifacts,
  setBonuses,
  activeDetails,
  toggleDetails,
  onClickEmptyArtIcon,
}: GearsOverviewProps) {
  //
  const renderWeaponThumb = () => {
    const { type, code, ...rest } = weapon;
    const dataWeapon = $AppData.getWeapon(weapon.code);

    if (!dataWeapon) {
      return null;
    }
    const { beta, icon, rarity } = dataWeapon;

    return (
      <div className="p-1 w-1/3">
        <ItemCase chosen={activeDetails === "weapon"} onClick={() => toggleDetails("weapon")}>
          {(className, imgCls) => (
            <ItemThumbnail
              className={className}
              imgCls={imgCls}
              item={{ beta, icon, rarity, ...rest, owner: undefined }}
            />
          )}
        </ItemCase>
      </div>
    );
  };

  return (
    <div className="py-4">
      <div className="flex flex-wrap">
        {renderWeaponThumb()}

        {artifacts.map((artifact, i) =>
          artifact ? (
            <div key={i} className="p-1 w-1/3">
              <ItemCase chosen={activeDetails === i} onClick={() => toggleDetails(i)}>
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
                onClick={() => onClickEmptyArtIcon(i)}
              >
                <GenshinImage className="w-full" src={Artifact_.iconOf(ARTIFACT_TYPES[i])} />
              </button>
            </div>
          )
        )}
      </div>

      <div
        className={clsx("mt-3", bonusStyles(activeDetails === "setBonus"))}
        onClick={() => {
          if (setBonuses.length) toggleDetails("setBonus");
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
          activeDetails === "setBonus" ? (
            <CloseButton className="ml-auto" size="small" />
          ) : (
            <Button className="ml-auto group-hover:bg-primary-1" size="small" icon={<FaInfo />} />
          )
        ) : null}
      </div>

      <div
        className={clsx("mt-2", bonusStyles(activeDetails === "statsBonus"))}
        onClick={() => toggleDetails("statsBonus")}
      >
        <p className="text-lg text-heading-color font-semibold">Artifact details</p>

        {activeDetails === "statsBonus" ? (
          <CloseButton className="ml-auto" size="small" />
        ) : (
          <Button className="ml-auto group-hover:bg-primary-1" size="small" icon={<FaInfo />} />
        )}
      </div>
    </div>
  );
}
