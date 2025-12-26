import { CloseButton, clsx, cn, VersatileSelect } from "rond";

import type { ITeammate } from "@/types";
import { genSequentialOptions } from "@/utils";

import { GenshinImage } from "../GenshinImage";

type TeammateItemsProps = {
  className?: string;
  mutable?: boolean;
  teammate: ITeammate;
  onClickWeapon?: () => void;
  onChangeWeaponRefinement?: (newRefinement: number) => void;
  onClickArtifact?: () => void;
  onClickRemoveArtifact?: () => void;
};

export function TeammateItems({
  className,
  mutable,
  teammate,
  onClickWeapon,
  onChangeWeaponRefinement,
  onClickArtifact,
  onClickRemoveArtifact,
}: TeammateItemsProps) {
  const { weapon } = teammate;
  const weaponData = weapon.data;
  const { name: artifactSetName, flower } = teammate.artifact?.data || {};
  const { icon: artifactSetIcon } = flower || {};

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex space-x-2">
        <button
          className={`w-14 h-14 rounded bg-gradient-${weaponData.rarity} shrink-0`}
          disabled={!mutable}
          onClick={onClickWeapon}
        >
          <GenshinImage src={weaponData.icon} alt="weapon" fallbackCls="p-2" />
        </button>

        <div className="overflow-hidden">
          <p className={`text-rarity-${weaponData.rarity} text-base font-semibold truncate`}>
            {weaponData.name}
          </p>
          {mutable ? (
            weaponData.rarity >= 3 && (
              <div className="flex items-center">
                <span>Refinement</span>
                <VersatileSelect
                  title="Select Refinement"
                  transparent
                  align="right"
                  className={`ml-2 w-10 text-rarity-${weaponData.rarity}`}
                  options={genSequentialOptions(5)}
                  value={weapon.refi}
                  onChange={(value) => onChangeWeaponRefinement?.(+value)}
                />
              </div>
            )
          ) : (
            <p>
              Refinement{" "}
              <span className={`ml-1 text-rarity-${weaponData.rarity} font-semibold`}>
                {weapon.refi}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <button className="w-14 h-14 shrink-0" disabled={!mutable} onClick={onClickArtifact}>
          <GenshinImage
            className={clsx("bg-dark-3 rounded", !artifactSetIcon && "p-1")}
            src={artifactSetIcon || "6/6a/Icon_Inventory_Artifacts"}
            alt="artifact"
            fallbackCls="p-2"
            imgType="unknown"
          />
        </button>

        <p
          className={clsx(
            "mt-1 grow font-semibold text-base truncate",
            artifactSetName ? "text-light-1" : "text-light-hint"
          )}
        >
          {artifactSetName || "No artifact buff / debuff"}
        </p>

        {artifactSetName && mutable && <CloseButton boneOnly onClick={onClickRemoveArtifact} />}
      </div>
    </div>
  );
}
