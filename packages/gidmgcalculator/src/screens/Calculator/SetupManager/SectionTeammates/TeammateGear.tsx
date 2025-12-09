import { useState } from "react";

import type { AppCharacter, ITeammate } from "@/types";
import {
  changeTeammateArtifact,
  changeTeammateWeapon,
  updateTeammateWeapon,
} from "@Store/calculator/actions";

import {
  ArtifactForge,
  ArtifactForgeProps,
  TeammateItems,
  WeaponForge,
  WeaponForgeProps,
} from "@/components";

type TeammateGearProps = {
  teammate: ITeammate;
  info: AppCharacter;
};

export function TeammateGear({ teammate, info }: TeammateGearProps) {
  const [modalType, setModalType] = useState<"WEAPON" | "ARTIFACT" | null>(null);

  const handleWeaponRefinementChange = (refi: number) => {
    updateTeammateWeapon(teammate.data.code, { refi });
  };

  const handleArtifactRemove = () => {
    changeTeammateArtifact(teammate.data.code, undefined);
  };

  const handleWeaponChange: WeaponForgeProps["onForgeWeapon"] = (weapon) => {
    changeTeammateWeapon(teammate.data.code, weapon);
  };

  const handleArtifactChange: ArtifactForgeProps["onForgeArtifact"] = (artifact) => {
    changeTeammateArtifact(teammate.data.code, artifact);
  };

  // const handleEnhanceToggle = (enhanced: boolean) => {
  //   dispatch(updateTeammate({ teammateIndex: index, enhanced }));
  // };

  return (
    <>
      <div className="bg-dark-2 pt-2">
        <div className="bg-dark-1 pt-12 px-2 pb-3" onDoubleClick={() => console.log(teammate)}>
          {/* <div className="mb-4 flex" hidden={!info.enhanceType}>
            <Checkbox checked={!!teammate.enhanced} onChange={handleEnhanceToggle}>
              Witch's Buff
            </Checkbox>
          </div> */}

          <TeammateItems
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
