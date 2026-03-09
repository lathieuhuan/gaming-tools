import type { ArtifactType } from "@/types";
import type {
  ArtifactSaveOutput,
  CharacterSaveOutput,
  SavingSteps,
  WeaponSaveOutput,
} from "../types";

import { useStore } from "@/lib/dynamic-store";
import IdStore from "@/utils/IdStore";
import { useDispatch } from "@Store/hooks";
import {
  addDbCharacter,
  addDbArtifact,
  addDbWeapon,
  updateDbArtifact,
  updateDbCharacter,
  updateDbWeapon,
} from "@Store/userdbSlice";

export function useSaveOutputHandler() {
  const store = useStore();
  const dispatch = useDispatch();

  const handleCharacterSaveOutput = (
    output: CharacterSaveOutput,
    weaponID: number,
    artifactIDs: number[]
  ) => {
    switch (output.action) {
      case "CREATE":
        dispatch(
          addDbCharacter({
            ...output.character,
            weaponID,
            artifactIDs,
          })
        );
        return;
      case "UPDATE":
        dispatch(
          updateDbCharacter({
            ...output.character,
            weaponID,
            artifactIDs,
          })
        );
        return;
      case "NONE":
        dispatch(
          updateDbCharacter({
            code: output.character.code,
            weaponID,
            artifactIDs,
          })
        );
        return;
    }
  };

  const handleWeaponSaveOutput = (
    output: WeaponSaveOutput,
    owner: number,
    idStore: IdStore,
    currentWeaponID?: number
  ) => {
    switch (output.action) {
      case "CREATE": {
        const weaponId = idStore.gen();

        dispatch(
          addDbWeapon({
            ...output.weapon,
            ID: weaponId,
            owner,
          })
        );

        if (currentWeaponID) {
          dispatch(
            updateDbWeapon({
              ID: currentWeaponID,
              owner: undefined,
            })
          );
        }

        return weaponId;
      }
      case "UPDATE":
        dispatch(
          updateDbWeapon({
            ...output.weapon,
            owner,
          })
        );

        if (currentWeaponID && currentWeaponID !== output.weapon.ID) {
          dispatch(
            updateDbWeapon({
              ID: currentWeaponID,
              owner: undefined,
            })
          );
        }

        return output.weapon.ID;
      default:
        return output.weapon.ID;
    }
  };

  const handleArtifactSaveOutput = (
    output: ArtifactSaveOutput,
    owner: number,
    idStore: IdStore,
    currentArtifactID?: number
  ) => {
    switch (output.action) {
      case "CREATE": {
        const artifactId = idStore.gen();

        dispatch(
          addDbArtifact({
            ...output.artifact,
            ID: artifactId,
            owner,
          })
        );

        if (currentArtifactID) {
          dispatch(
            updateDbArtifact({
              ID: currentArtifactID,
              owner: undefined,
            })
          );
        }

        return artifactId;
      }
      case "UPDATE": {
        const { owner: currentOwner, ID: artifactID } = output.artifact;

        dispatch(
          updateDbArtifact({
            ...output.artifact,
            owner,
          })
        );

        // TODO: improve this handler
        if (currentOwner && currentOwner !== owner) {
          const currentCharacter = store.select((state) =>
            state.userdb.userChars.find((char) => char.code === currentOwner)
          );
          const newArtifactIDs =
            currentCharacter?.artifactIDs.filter((id) => id !== artifactID) || [];

          dispatch(
            updateDbCharacter({
              code: currentOwner,
              artifactIDs: newArtifactIDs,
            })
          );
        }

        if (currentArtifactID && currentArtifactID !== artifactID) {
          dispatch(
            updateDbArtifact({
              ID: currentArtifactID,
              owner: undefined,
            })
          );
        }

        return artifactID;
      }
      default:
        return output.artifact.ID;
    }
  };

  const handleSaveOutput = (
    characterOutput: CharacterSaveOutput,
    weaponOutput: WeaponSaveOutput,
    artifactsOutput: ArtifactSaveOutput[],
    steps: SavingSteps
  ) => {
    const [, { currentWeapon }, ...artifactSteps] = steps;
    const currentArtifactIds = artifactSteps.reduce<Partial<Record<ArtifactType, number>>>(
      (acc, step) => {
        acc[step.data.type] = step.currentArtifact?.ID;
        return acc;
      },
      {}
    );
    const idStore = new IdStore();

    const weaponID = handleWeaponSaveOutput(
      weaponOutput,
      characterOutput.character.code,
      idStore,
      currentWeapon?.ID
    );
    const artifactIDs = artifactsOutput.map((artifact) =>
      handleArtifactSaveOutput(
        artifact,
        characterOutput.character.code,
        idStore,
        currentArtifactIds[artifact.artifact.type]
      )
    );

    handleCharacterSaveOutput(characterOutput, weaponID, artifactIDs);
  };

  return handleSaveOutput;
}
