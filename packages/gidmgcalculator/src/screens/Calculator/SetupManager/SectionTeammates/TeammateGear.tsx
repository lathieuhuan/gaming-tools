import { useState } from "react";

import { WeaponType } from "@Calculation";
import { ArtifactForge, TeammateItems, WeaponForge } from "@/components";
import { Artifact, Teammate, Weapon } from "@/types";
import { useDispatch } from "@Store/hooks";
import { updateTeammateArtifact, updateTeammateWeapon } from "@Store/calculator-slice";

type TeammateGearProps = {
  teammate: Teammate;
  index: number;
  weaponType: WeaponType;
};

export function TeammateGear({ teammate, index, weaponType }: TeammateGearProps) {
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

  return (
    <>
      <div className="bg-dark-2 pt-2">
        <TeammateItems
          mutable
          className="bg-dark-1 pt-12 px-2 pb-3"
          teammate={teammate}
          onClickWeapon={() => setModalType("WEAPON")}
          onChangeWeaponRefinement={handleWeaponRefinementChange}
          onClickArtifact={() => setModalType("ARTIFACT")}
          onClickRemoveArtifact={handleArtifactRemove}
        />
      </div>

      <WeaponForge
        active={modalType === "WEAPON"}
        forcedType={weaponType}
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
