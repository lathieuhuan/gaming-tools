import { ReactNode, useCallback, useRef, useState } from "react";
import { CloseButton, Modal } from "rond";

import type { GenshinUserBuild } from "@/services/enka";
import type { SavingStep } from "./_types";

import { useStore } from "@/systems/dynamic-store";
import { createWeapon } from "@/utils/entity";
import IdStore from "@/utils/IdStore";
import { useDispatch } from "@Store/hooks";
import {
  getCharacterSaveConfig,
  getNewBuildArtifactSaveConfigs,
  getNewBuildWeaponSaveConfig,
  getOldBuildWeaponSaveConfig,
  getWeaponSavingStep,
} from "./_logic";

import { BuildSaverContext, BuildSaverContextState } from "./_context";
import { SavingStepper } from "./SavingStepper";

export function BuildSaver({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const store = useStore();
  const buildRef = useRef<GenshinUserBuild>();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savingSteps, setSavingSteps] = useState<SavingStep[]>([]);

  const closeSaveModal = () => {
    setSaveModalOpen(false);
  };

  // const saveWeapon = (weapon: IWeaponBasic) => {
  //   dispatch(addUserWeapon(weapon));

  //   notification.success({
  //     content: "Weapon saved successfully!",
  //   });
  // };

  const requestSave = useCallback<BuildSaverContextState>((build) => {
    buildRef.current = build;

    const { character, artifacts } = build;
    const { userChars, userWps, userArts } = store.select((state) => state.userdb);
    const idStore = new IdStore();
    const savingSteps: SavingStep[] = [];

    const characterSaveConfig = getCharacterSaveConfig(character, userChars);

    savingSteps.push({
      type: "CHARACTER",
      data: character,
      config: characterSaveConfig,
    });

    const weapon = createWeapon(build.weapon, build.weapon.data, idStore);

    savingSteps.push(getWeaponSavingStep(weapon, userWps));

    savingSteps.push(...getNewBuildArtifactSaveConfigs(artifacts, userArts));

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

        <SavingStepper steps={savingSteps} onComplete={closeSaveModal} />
      </Modal.Core>
    </BuildSaverContext.Provider>
  );
}
