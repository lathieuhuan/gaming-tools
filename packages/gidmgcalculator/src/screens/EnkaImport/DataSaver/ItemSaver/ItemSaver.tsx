import { ReactNode, useCallback, useState } from "react";
import { CloseButton, Modal } from "rond";

import type { IArtifactBasic } from "@/types";
import type { ItemSavingStep } from "./_types";

import { useStore } from "@/systems/dynamic-store";
import { createArtifact, createWeapon } from "@/utils/entity";
import { ItemSaverContext, ItemSaverContextState } from "./_context";

import { ArtifactSaver } from "./ArtifactSaver";
import { WeaponSaver } from "./WeaponSaver";

const areSimilarArtifacts = (artifact1: IArtifactBasic, artifact2: IArtifactBasic) => {
  return (
    artifact1.code === artifact2.code &&
    artifact1.type === artifact2.type &&
    artifact1.rarity === artifact2.rarity &&
    artifact1.mainStatType === artifact2.mainStatType
  );
};

export function ItemSaver({ children }: { children: ReactNode }) {
  const store = useStore();
  const [savingSteps, setSavingSteps] = useState<ItemSavingStep[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const closeSaveModal = () => {
    setSaveModalOpen(false);
  };

  const requestSave = useCallback<ItemSaverContextState>(({ weapon, artifacts }, type) => {
    switch (type) {
      case "WEAPON": {
        const sameWeapons = store.select((state) =>
          state.userdb.userWps.filter((userWeapon) => userWeapon.code === weapon.code)
        );

        setSavingSteps([
          {
            type: "WEAPON",
            data: createWeapon(weapon, weapon.data),
            sameWeapons,
          },
        ]);
        break;
      }
      case "ARTIFACTS": {
        break;
      }
      default: {
        const artifact = artifacts[type];

        if (!artifact) {
          return;
        }

        const sameArtifacts = store.select((state) =>
          state.userdb.userArts.filter((userAtf) => areSimilarArtifacts(userAtf, artifact))
        );

        setSavingSteps([
          {
            type: "ARTIFACT",
            data: createArtifact(artifact, artifact.data),
            sameArtifacts,
          },
        ]);
        break;
      }
    }

    setSaveModalOpen(true);
  }, []);

  let savingFlow: ReactNode = null;

  if (savingSteps.length === 1) {
    const [step] = savingSteps;

    if (step.type === "WEAPON") {
      savingFlow = (
        <WeaponSaver
          weapon={step.data}
          sameWeapons={step.sameWeapons}
          onComplete={closeSaveModal}
        />
      );
    } else {
      savingFlow = (
        <ArtifactSaver
          artifact={step.data}
          sameArtifacts={step.sameArtifacts}
          onComplete={closeSaveModal}
        />
      );
    }
  }

  return (
    <ItemSaverContext.Provider value={requestSave}>
      {children}

      <Modal.Core
        active={saveModalOpen}
        className="w-88 h-[90vh] max-h-[736px] rounded-lg shadow-popup"
        onClose={closeSaveModal}
      >
        <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={closeSaveModal} />

        {savingFlow}
      </Modal.Core>
    </ItemSaverContext.Provider>
  );
}
