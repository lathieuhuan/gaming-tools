import isEqual from "react-fast-compare";
import { batch } from "react-redux";

import type { AppThunk } from "./store";
import type { CalcSetup } from "@/models/calculator";

// Store
import { updateUI } from "./ui-slice";
import {
  addUserArtifact,
  addUserWeapon,
  saveSetup,
  updateUserArtifact,
  updateUserWeapon,
} from "./userdb-slice";

// Util
import Array_ from "@/utils/Array";
import { createArtifactBasic, createWeaponBasic } from "@/utils/Entity";
import Setup_, { isDbSetup } from "@/utils/Setup";

export function saveSetupThunk(setup: CalcSetup, name: string): AppThunk {
  return (dispatch, getState) => {
    const { userSetups, userWps, userArts } = getState().userdb;
    const { weapon, artifact } = setup.char;

    let seedID = Date.now();
    let weaponID = weapon.ID;
    const dbSetup = Array_.findById(userSetups, setup.ID);
    const isOldSetup = dbSetup && isDbSetup(dbSetup);

    const existedWeapon = Array_.findById(userWps, weapon.ID);
    const weaponBasic = weapon.serialize();

    if (existedWeapon) {
      if (isEqual(weaponBasic, createWeaponBasic(existedWeapon))) {
        // Nothing changes => add setupID to existedWeapon
        const newSetupIDs = existedWeapon.setupIDs || [];

        if (!newSetupIDs.includes(setup.ID)) {
          dispatch(
            updateUserWeapon({
              ID: existedWeapon.ID,
              setupIDs: newSetupIDs.concat(setup.ID),
            })
          );
        }
      } else {
        // Something changes => Duplicate existedWeapon and add it along with setupID
        weaponID = seedID++;

        dispatch(
          addUserWeapon({
            ...weaponBasic,
            ID: weaponID,
            setupIDs: [setup.ID],
          })
        );

        // Remove setupID from existed weapon
        dispatch(
          updateUserWeapon({
            ID: existedWeapon.ID,
            setupIDs: existedWeapon.setupIDs?.filter((ID) => ID !== setup.ID),
          })
        );
      }
    } else {
      // Weapon not found => Add new weapon with setupID
      dispatch(
        addUserWeapon({
          ...weaponBasic,
          setupIDs: [setup.ID],
        })
      );

      if (isOldSetup) {
        // Remove setupID from the setup's old weapon
        const oldWeapon = Array_.findById(userWps, dbSetup.weaponID);

        if (oldWeapon) {
          dispatch(
            updateUserWeapon({
              ID: dbSetup.weaponID,
              setupIDs: oldWeapon.setupIDs?.filter((ID) => ID !== setup.ID),
            })
          );
        }
      }
    }

    const artifactIDs = artifact.pieces.map((piece) => piece.ID);

    artifact.pieces.forEach((piece, pieceIndex) => {
      const existedPiece = Array_.findById(userArts, piece.ID);
      const pieceBasic = piece.serialize();

      if (existedPiece) {
        if (isEqual(pieceBasic, createArtifactBasic(existedPiece))) {
          // Nothing changes => add setupID to existedArtifact
          const newSetupIDs = existedPiece.setupIDs || [];

          if (!newSetupIDs.includes(setup.ID)) {
            dispatch(
              updateUserArtifact({
                ID: existedPiece.ID,
                setupIDs: newSetupIDs.concat(setup.ID),
              })
            );
          }
        } else {
          // Something changes => Add new artifact with setupID
          const artifactID = seedID++;
          artifactIDs[pieceIndex] = artifactID;

          dispatch(
            addUserArtifact({
              ...pieceBasic,
              ID: artifactID,
              setupIDs: [setup.ID],
            })
          );

          // Remove setupID from existed artifact
          dispatch(
            updateUserArtifact({
              ID: existedPiece.ID,
              setupIDs: existedPiece.setupIDs?.filter((ID) => ID !== setup.ID),
            })
          );
        }
      } else {
        // Artifact not found => Add new artifact with setupID
        dispatch(
          addUserArtifact({
            ...pieceBasic,
            setupIDs: [setup.ID],
          })
        );

        if (isOldSetup) {
          // Remove setupID from the setup's old artifact
          const oldArtifactID = dbSetup.artifactIDs[pieceIndex];
          const oldArtifact = oldArtifactID ? Array_.findById(userArts, oldArtifactID) : undefined;

          if (oldArtifact) {
            dispatch(
              updateUserArtifact({
                ID: oldArtifact.ID,
                setupIDs: oldArtifact.setupIDs?.filter((ID) => ID !== setup.ID),
              })
            );
          }
        }
      }
    });

    batch(() => {
      dispatch(
        saveSetup({
          ID: setup.ID,
          name,
          data: Setup_.cleanupCalcSetup(setup, calculator.target, { weaponID, artifactIDs }),
        })
      );
      dispatch(updateUI({ setupDirectorActive: false }));
    });
  };
}
