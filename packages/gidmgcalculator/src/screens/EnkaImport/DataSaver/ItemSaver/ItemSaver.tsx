import { ReactNode, useCallback, useState } from "react";
import { CloseButton, Modal, notification } from "rond";

import type { ItemSavingStep } from "./types";

import { useStoreCheck } from "@/hooks/useStoreCheck";
import { isSameArtifact, isSameWeapon } from "../logic";
import { ItemSaverContext, ItemSaverContextState } from "./context";

import { ArtifactSaver } from "./ArtifactSaver";
import { WeaponSaver } from "./WeaponSaver";

export function ItemSaver({ children }: { children: ReactNode }) {
  const { store, isAbleToAddWeapon, isAbleToAddArtifact } = useStoreCheck();
  const [savingSteps, setSavingSteps] = useState<ItemSavingStep[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const closeSaveModal = () => {
    setSaveModalOpen(false);
  };

  const requestSave = useCallback<ItemSaverContextState>(({ weapon, atfGear }, type) => {
    switch (type) {
      case "WEAPON": {
        const error = isAbleToAddWeapon(1);

        if (error) {
          notification.error({ content: error.message });
          return;
        }

        const sameWeapons = store.select((state) =>
          state.userdb.userWps.filter((userWeapon) => isSameWeapon(userWeapon, weapon))
        );

        setSavingSteps([
          {
            type: "WEAPON",
            data: weapon,
            sameWeapons,
          },
        ]);
        break;
      }
      case "ARTIFACTS": {
        break;
      }
      default: {
        const artifact = atfGear.pieces.get(type);

        if (!artifact) {
          return;
        }

        const error = isAbleToAddArtifact(1);

        if (error) {
          notification.error({ content: error.message });
          return;
        }

        const sameArtifacts = store.select((state) =>
          state.userdb.userArts.filter((userAtf) => isSameArtifact(userAtf, artifact))
        );

        setSavingSteps([
          {
            type: "ARTIFACT",
            data: artifact,
            sameArtifacts,
          },
        ]);
        break;
      }
    }

    setSaveModalOpen(true);
  }, []);

  const renderSavingContent = () => {
    const [step] = savingSteps;

    if (!step) {
      return null;
    }

    if (step.type === "WEAPON") {
      return (
        <WeaponSaver
          weapon={step.data}
          sameWeapons={step.sameWeapons}
          onComplete={closeSaveModal}
        />
      );
    }

    return (
      <ArtifactSaver
        artifact={step.data}
        sameArtifacts={step.sameArtifacts}
        onComplete={closeSaveModal}
      />
    );
  };

  return (
    <ItemSaverContext.Provider value={requestSave}>
      {children}

      <Modal.Core
        active={saveModalOpen}
        className="w-88 h-[90vh] max-h-[736px] rounded-lg shadow-popup"
        onClose={closeSaveModal}
      >
        <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={closeSaveModal} />
        {renderSavingContent()}
      </Modal.Core>
    </ItemSaverContext.Provider>
  );
}
