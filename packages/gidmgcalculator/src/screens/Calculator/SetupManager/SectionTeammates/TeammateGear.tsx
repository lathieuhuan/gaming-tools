import { useState } from "react";

import type { AppCharacter, ITeammate } from "@/types";
import {
  changeTeammateArtifact,
  changeTeammateWeapon,
  toggleTeammateEnhance,
  updateTeammateWeapon,
} from "@Store/calculator/actions";

import {
  ArtifactForge,
  ArtifactForgeProps,
  TeammateItems,
  WeaponForge,
  WeaponForgeProps,
} from "@/components";
import { Checkbox } from "rond";

type TeammateGearProps = {
  teammate: ITeammate;
  info: AppCharacter;
};

export function TeammateGear({ teammate, info }: TeammateGearProps) {
  const [modalType, setModalType] = useState<"WEAPON" | "ARTIFACT" | null>(null);
  const { data } = teammate;

  const handleWeaponRefinementChange = (refi: number) => {
    updateTeammateWeapon(data.code, { refi });
  };

  const handleArtifactRemove = () => {
    changeTeammateArtifact(data.code, undefined);
  };

  const handleWeaponChange: WeaponForgeProps["onForgeWeapon"] = (weapon) => {
    changeTeammateWeapon(data.code, weapon);
  };

  const handleArtifactChange: ArtifactForgeProps["onForgeArtifact"] = (artifact) => {
    changeTeammateArtifact(data.code, artifact);
  };

  const handleEnhanceToggle = () => {
    toggleTeammateEnhance(data.code);
  };

  return (
    <>
      <div className="bg-dark-2 pt-2">
        <div className="bg-dark-1 pt-12 px-2 pb-3" onDoubleClick={() => console.log(teammate)}>
          <div className="mb-4 flex" hidden={!data.enhanceType}>
            <Checkbox checked={teammate.enhanced} onChange={handleEnhanceToggle}>
              Hexerei
            </Checkbox>
          </div>

          <TeammateItems
            className="space-y-3"
            mutable
            teammate={teammate}
            onClickWeapon={() => setModalType("WEAPON")}
            onChangeWeaponRefinement={handleWeaponRefinementChange}
            onClickArtifact={() => setModalType("ARTIFACT")}
            onClickRemoveArtifact={handleArtifactRemove}
          />
        </div>
      </div>

      <WeaponForge
        active={modalType === "WEAPON"}
        forcedType={info.weaponType}
        onForgeWeapon={handleWeaponChange}
        onClose={() => setModalType(null)}
      />

      <ArtifactForge
        active={modalType === "ARTIFACT"}
        forcedType="flower"
        forFeature="TEAMMATE_MODIFIERS"
        onForgeArtifact={handleArtifactChange}
        onClose={() => setModalType(null)}
      />
    </>
  );
}
