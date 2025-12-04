import { useState } from "react";

import { AppCharacter, WeaponType } from "@Calculation";
import { ArtifactForge, TeammateItems, WeaponForge } from "@/components";
import { Artifact, Teammate, Weapon } from "@/types";
import { useDispatch } from "@Store/hooks";
import {
  updateTeammate,
  updateTeammateArtifact,
  updateTeammateWeapon,
} from "@Store/calculator-slice";
import { Checkbox } from "rond";

type TeammateGearProps = {
  teammate: Teammate;
  index: number;
  info: AppCharacter;
};

export function TeammateGear({ teammate, index, info }: TeammateGearProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<"WEAPON" | "ARTIFACT" | null>(null);

  const handleWeaponRefinementChange = (refi: number) => {
    dispatch(
      updateTeammateWeapon({
        teammateIndex: index,
        refi,
      })
    );
  };

  const handleArtifactRemove = () => {
    dispatch(
      updateTeammateArtifact({
        teammateIndex: index,
        code: -1,
      })
    );
  };

  const handleWeaponChange = (weapon: Weapon) => {
    dispatch(
      updateTeammateWeapon({
        teammateIndex: index,
        code: weapon.code,
      })
    );
  };

  const handleArtifactChange = (artifact: Artifact) => {
    dispatch(
      updateTeammateArtifact({
        teammateIndex: index,
        code: artifact.code,
      })
    );
  };

  const handleEnhanceToggle = (enhanced: boolean) => {
    dispatch(updateTeammate({ teammateIndex: index, enhanced }));
  };

  return (
    <>
      <div className="bg-dark-2 pt-2">
        <div className="bg-dark-1 pt-12 px-2 pb-3">
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
