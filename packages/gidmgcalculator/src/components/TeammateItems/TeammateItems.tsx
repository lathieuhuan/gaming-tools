import { clsx, CloseButton } from "rond";

import type { Teammate } from "@Src/types";
import { $AppData } from "@Src/services";
import { GenshinImage } from "../GenshinImage";

interface TeammateItemsProps {
  className?: string;
  mutable?: boolean;
  teammate: Teammate;
  onClickWeapon?: () => void;
  onChangeWeaponRefinement?: (newRefinement: number) => void;
  onClickArtifact?: () => void;
  onClickRemoveArtifact?: () => void;
}
export const TeammateItems = ({
  className = "",
  mutable,
  teammate,
  onClickWeapon,
  onChangeWeaponRefinement,
  onClickArtifact,
  onClickRemoveArtifact,
}: TeammateItemsProps) => {
  const { weapon, artifact } = teammate;
  const appWeapon = $AppData.getWeapon(weapon.code);
  const { name: artifactSetName, flower } = $AppData.getArtifactSet(artifact.code) || {};
  const { icon: artifactSetIcon = "" } = flower || {};

  return (
    <div className={`space-y-3 ${className}`}>
      {appWeapon && (
        <div className="flex space-x-2">
          <button
            className={`w-14 h-14 rounded bg-gradient-${appWeapon.rarity} shrink-0`}
            disabled={!mutable}
            onClick={onClickWeapon}
          >
            <GenshinImage src={appWeapon.icon} alt="weapon" defaultFallback={{ wrapperCls: "p-2" }} />
          </button>

          <div className="overflow-hidden">
            <p className={`text-rarity-${appWeapon.rarity} text-base font-semibold truncate`}>{appWeapon.name}</p>
            {mutable ? (
              appWeapon.rarity >= 3 && (
                <div className="flex items-center">
                  <span>Refinement</span>
                  <select
                    className={`ml-2 pr-1 text-rarity-${appWeapon.rarity} text-right`}
                    value={weapon.refi}
                    onChange={(e) => onChangeWeaponRefinement?.(+e.target.value)}
                  >
                    {[...Array(5)].map((_, index) => {
                      return (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )
            ) : (
              <p>
                Refinement <span className={`ml-1 text-rarity-${appWeapon.rarity} font-semibold`}>{weapon.refi}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start space-x-2">
        <button className="w-14 h-14 shrink-0" disabled={!mutable} onClick={onClickArtifact}>
          <GenshinImage
            className={artifactSetIcon ? "bg-dark-500 rounded" : "p-1"}
            src={artifactSetIcon || "6/6a/Icon_Inventory_Artifacts"}
            alt="artifact"
            defaultFallback={{ wrapperCls: "p-2" }}
            imgType="unknown"
          />
        </button>

        <p
          className={clsx(
            "mt-1 grow font-semibold text-base truncate",
            artifactSetName ? "text-light-400" : "text-light-800"
          )}
        >
          {artifactSetName || "No artifact buff / debuff"}
        </p>

        {artifactSetName && mutable ? <CloseButton boneOnly onClick={onClickRemoveArtifact} /> : null}
      </div>
    </div>
  );
};
