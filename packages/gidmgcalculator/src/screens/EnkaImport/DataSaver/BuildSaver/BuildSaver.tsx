import { ReactNode, useCallback, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { CloseButton, Modal } from "rond";

import type { GenshinUserBuild } from "@/services/enka";
import type { ICharacterBasic, IWeapon, IWeaponBasic } from "@/types";
import type { GOODCharacterConvertReturn } from "@/utils/GOOD";
import type { CharacterSavingStep, SavingStep, WeaponSavingStep } from "./_types";

import { useStore } from "@/systems/dynamic-store";
import { createWeapon } from "@/utils/entity";
import IdStore from "@/utils/IdStore";
import Object_ from "@/utils/Object";
import { useDispatch } from "@Store/hooks";
import { BuildSaverContext, BuildSaverContextState } from "./_context";

import { SavingStepper } from "./SavingStepper";
import { Weapon } from "@/models/base";
import {
  getCharacterSaveConfig,
  getNewBuildWeaponSaveConfig,
  getOldBuildWeaponSaveConfig,
} from "./_logic";

const charComparedFields: (keyof ICharacterBasic)[] = ["level", "NAs", "ES", "EB", "cons"];

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

    if (characterSaveConfig.status === "NEW") {
      savingSteps.push({
        type: "WEAPON",
        data: weapon,
        config: getNewBuildWeaponSaveConfig(weapon, userWps),
      });
    } else {
      savingSteps.push({
        type: "WEAPON",
        data: weapon,
        config: getOldBuildWeaponSaveConfig(
          weapon,
          userWps,
          characterSaveConfig.existedCharacter.weaponID
        ),
      });
    }

    setSavingSteps(savingSteps);
    setSaveModalOpen(true);

    // const makeArtifactSavingStep = (atfIndex: number): ArtifactSavingStep | null => {
    //   const artifact = build.artifacts[atfIndex];

    //   return artifact
    //     ? {
    //         type: "ARTIFACT",
    //         data: createArtifact(artifact, artifact.data, idStore),
    //       }
    //     : null;
    // };

    // const atfSavingSteps = build.artifacts.reduce<ArtifactSavingStep[]>((steps, _, index) => {
    //   const atfSavingStep = makeArtifactSavingStep(index);
    //   return atfSavingStep ? steps.concat(atfSavingStep) : steps;
    // }, []);

    // if (isSavingBuild) {
    //   const savingSteps: SavingStep[] = [
    //     ...atfSavingSteps,
    //     makeWeaponSavingStep(),
    //     {
    //       type: "CHARACTER",
    //       data: build.character,
    //     },
    //   ];

    // }
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
