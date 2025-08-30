import isEqual from "react-fast-compare";
import { batch } from "react-redux";

import { $AppCharacter, $AppSettings } from "@/services";
import type { AppThunk } from "./store";

// Store
import { initNewSession } from "./calculator-slice";
import { updateUI } from "./ui-slice";
import { addUserArtifact, addUserWeapon, saveSetup, updateUserArtifact, updateUserWeapon } from "./userdb-slice";

// Util
import Array_ from "@/utils/array-utils";
import Entity_ from "@/utils/entity-utils";
import Setup_ from "@/utils/setup-utils";
import { parseUserCharacter, type CharacterForInit } from "./store.utils";

export function initNewSessionWithCharacter(character: CharacterForInit): AppThunk {
  return (dispatch, getState) => {
    const { userWps, userArts } = getState().userdb;

    const ID = Date.now();
    const appCharacter = $AppCharacter.get(character.name);
    const data = parseUserCharacter({
      character,
      userWps,
      userArts,
      weaponType: appCharacter.weaponType,
      seedID: ID + 1,
    });

    dispatch(
      initNewSession({
        ID,
        calcSetup: Setup_.createCalcSetup({
          char: data.character,
          weapon: data.weapon,
          artifacts: data.artifacts,
        }),
        target: Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
      })
    );
  };
}

export function saveSetupThunk(setupID: number, name: string): AppThunk {
  return (dispatch, getState) => {
    const {
      calculator,
      userdb: { userSetups, userWps, userArts },
    } = getState();

    const setup = calculator.setupsById[setupID];
    const { weapon, artifacts } = setup;
    let seedID = Date.now();
    let weaponID = weapon.ID;
    const artifactIDs = artifacts.map((artifact) => artifact?.ID ?? null);
    const userSetup = Array_.findById(userSetups, setupID);
    const existedWeapon = Array_.findById(userWps, weapon.ID);
    const isOldSetup = userSetup && Setup_.isUserSetup(userSetup);

    if (existedWeapon) {
      if (isEqual(weapon, Entity_.userItemToCalcItem(existedWeapon))) {
        // Nothing changes => add setupID to existedWeapon
        const newSetupIDs = existedWeapon.setupIDs || [];

        if (!newSetupIDs.includes(setupID)) {
          dispatch(
            updateUserWeapon({
              ID: existedWeapon.ID,
              setupIDs: newSetupIDs.concat(setupID),
            })
          );
        }
      } else {
        // Something changes => Add new weapon with setupID
        weaponID = seedID++;

        dispatch(
          addUserWeapon(
            Entity_.calcItemToUserItem(weapon, {
              ID: weaponID,
              setupIDs: [setupID],
            })
          )
        );

        // Remove setupID from existed weapon
        dispatch(
          updateUserWeapon({
            ID: existedWeapon.ID,
            setupIDs: existedWeapon.setupIDs?.filter((ID) => ID !== setupID),
          })
        );
      }
    } else {
      // Weapon not found => Add new weapon with setupID
      dispatch(
        addUserWeapon(
          Entity_.calcItemToUserItem(weapon, {
            setupIDs: [setupID],
          })
        )
      );

      if (isOldSetup) {
        // Remove setupID from the setup's old weapon
        const oldWeapon = Array_.findById(userWps, userSetup.weaponID);

        if (oldWeapon) {
          dispatch(
            updateUserWeapon({
              ID: userSetup.weaponID,
              setupIDs: oldWeapon.setupIDs?.filter((ID) => ID !== setupID),
            })
          );
        }
      }
    }

    artifacts.forEach((artifact, artifactIndex) => {
      if (!artifact) return;
      const existedArtifact = Array_.findById(userArts, artifact.ID);

      if (existedArtifact) {
        if (isEqual(artifact, Entity_.userItemToCalcItem(existedArtifact))) {
          // Nothing changes => add setupID to existedArtifact
          const newSetupIDs = existedArtifact.setupIDs || [];

          if (!newSetupIDs.includes(setupID)) {
            dispatch(
              updateUserArtifact({
                ID: existedArtifact.ID,
                setupIDs: newSetupIDs.concat(setupID),
              })
            );
          }
        } else {
          // Something changes => Add new artifact with setupID
          const artifactID = seedID++;
          artifactIDs[artifactIndex] = artifactID;

          dispatch(
            addUserArtifact(
              Entity_.calcItemToUserItem(artifact, {
                ID: artifactID,
                setupIDs: [setupID],
              })
            )
          );

          // Remove setupID from existed artifact
          dispatch(
            updateUserArtifact({
              ID: existedArtifact.ID,
              setupIDs: existedArtifact.setupIDs?.filter((ID) => ID !== setupID),
            })
          );
        }
      } else {
        // Artifact not found => Add new artifact with setupID
        dispatch(
          addUserArtifact(
            Entity_.calcItemToUserItem(artifact, {
              setupIDs: [setupID],
            })
          )
        );

        if (isOldSetup) {
          // Remove setupID from the setup's old artifact
          const oldArtifactID = userSetup.artifactIDs[artifactIndex];
          const oldArtifact = oldArtifactID ? Array_.findById(userArts, oldArtifactID) : undefined;

          if (oldArtifact) {
            dispatch(
              updateUserArtifact({
                ID: oldArtifact.ID,
                setupIDs: oldArtifact.setupIDs?.filter((ID) => ID !== setupID),
              })
            );
          }
        }
      }
    });

    batch(() => {
      dispatch(
        saveSetup({
          ID: setupID,
          name,
          data: Setup_.cleanupCalcSetup(setup, calculator.target, { weaponID, artifactIDs }),
        })
      );
      dispatch(updateUI({ setupDirectorActive: false }));
    });
  };
}
