import { ReactNode, useCallback, useRef, useState } from "react";
import { CloseButton, Modal } from "rond";

import type { GenshinUserBuild } from "@/services/enka";
import type { SavingSteps } from "./types";

import { useStore } from "@/lib/dynamic-store";
import { getArtifactSavingStep, getCharacterSavingStep, getWeaponSavingStep } from "./logic";

import { BuildSaverContext, BuildSaverContextState } from "./context";
import { SavingStepper } from "./SavingStepper";

export function BuildSaver({ children }: { children: ReactNode }) {
  const store = useStore();
  const buildRef = useRef<GenshinUserBuild>();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savingSteps, setSavingSteps] = useState<SavingSteps>();

  const closeSaveModal = () => {
    setSaveModalOpen(false);
  };

  const requestSave = useCallback<BuildSaverContextState>((build) => {
    buildRef.current = build;

    const { userChars, userWps, userArts } = store.select((state) => state.userdb);

    const savingSteps: SavingSteps = [
      getCharacterSavingStep(build.character, userChars),
      getWeaponSavingStep(build.weapon, userWps),
      ...getArtifactSavingStep(build.atfGear, userArts),
    ];

    setSavingSteps(savingSteps);
    setSaveModalOpen(true);
  }, []);

  return (
    <BuildSaverContext.Provider value={requestSave}>
      {children}

      <Modal.Core
        active={saveModalOpen}
        className="w-88 h-[90vh] max-h-[736px] rounded-lg shadow-popup"
        closeOnMaskClick={false}
        onClose={closeSaveModal}
      >
        <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={closeSaveModal} />

        {savingSteps && <SavingStepper steps={savingSteps} onComplete={closeSaveModal} />}
      </Modal.Core>
    </BuildSaverContext.Provider>
  );
}
