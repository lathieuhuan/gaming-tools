import { useState } from "react";

import type { Artifact, Teammate } from "@/models";
import type { AppCharacter } from "@/types";

import { ENHANCE_TOUR_SITE_ID } from "@/constants";
import { updateSetup } from "@Store/calculator/actions";

import { ArtifactForge } from "@/components/ArtifactForge";
import { EnhanceTag } from "@/components/EnhanceTag";
import { TeammateItems } from "@/components/TeammateItems";
import { WeaponForge, type WeaponForgeProps } from "@/components/WeaponForge";

type TeammateDetailProps = {
  teammate: Teammate;
  info: AppCharacter;
};

export function TeammateDetail({ teammate, info }: TeammateDetailProps) {
  const [modalType, setModalType] = useState<"WEAPON" | "ARTIFACT" | null>(null);
  const { data } = teammate;
  const elmtText = `text-${data.vision}`;

  const handleChangeWeaponRefinement = (refi: number) => {
    updateSetup((setup) => {
      setup.updateTeammateWeapon(data.code, { refi });
    });
  };

  const changeArtifact = (artifact: Artifact | undefined) => {
    updateSetup((setup) => {
      setup.changeTeammateArtifact(data.code, artifact);
    });
  };

  const handleForgeWeapon: WeaponForgeProps["onForgeWeapon"] = (weapon) => {
    updateSetup((setup) => {
      setup.changeTeammateWeapon(data.code, weapon);
    });
  };

  const handleToggleEnhance = () => {
    updateSetup((setup) => {
      setup.toggleTeammateEnhance(data.code);
    });
  };

  return (
    <>
      <div className="bg-dark-2 pt-2">
        <div className="bg-dark-1 pt-12 px-2 pb-3" onDoubleClick={() => console.info(teammate)}>
          <div className="mb-4 pl-1 flex items-center">
            <p className={`leading-none text-xl font-semibold ${elmtText}`}>{teammate.data.name}</p>

            <div hidden={!data.enhanceType} className="mx-2 w-px h-4 bg-dark-line" />

            <EnhanceTag
              id={ENHANCE_TOUR_SITE_ID.subEnhance(teammate.code)}
              mutable={true}
              character={teammate}
              onToggle={handleToggleEnhance}
            />
          </div>

          <TeammateItems
            mutable
            teammate={teammate}
            onClickWeapon={() => setModalType("WEAPON")}
            onChangeWeaponRefinement={handleChangeWeaponRefinement}
            onClickArtifact={() => setModalType("ARTIFACT")}
            onClickRemoveArtifact={() => changeArtifact(undefined)}
          />
        </div>
      </div>

      <WeaponForge
        active={modalType === "WEAPON"}
        forcedType={info.weaponType}
        onForgeWeapon={handleForgeWeapon}
        onClose={() => setModalType(null)}
      />

      <ArtifactForge
        active={modalType === "ARTIFACT"}
        forcedType="flower"
        forFeature="TEAMMATE_MODIFIERS"
        onForgeArtifact={changeArtifact}
        onClose={() => setModalType(null)}
      />
    </>
  );
}
