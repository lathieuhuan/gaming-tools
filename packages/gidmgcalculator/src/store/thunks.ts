import isEqual from "react-fast-compare";
import { Array_ } from "ron-utils";

import type { CalcSetup } from "@/models";
import type { AppThunk } from "./store";

import { isDbSetup, toDbSetup } from "@/logic/setup.logic";
import { Artifact, Weapon } from "@/models";
import { ArtifactType } from "@/types";
import { updateSetupAfterSave } from "./calculator/actions";
import { updateUI } from "./ui";
import {
  addDbArtifact,
  addDbWeapon,
  saveSetup,
  updateDbArtifact,
  updateDbWeapon,
} from "./userdbSlice";

export function saveSetupThunk(setup: CalcSetup, name: string): AppThunk {
  return (dispatch, getState) => {
    const { userSetups, userWps, userArts } = getState().userdb;
    const { weapon, atfGear } = setup.main;

    let seedID = Date.now();
    let weaponID = weapon.ID;
    const dbSetup = Array_.findById(userSetups, setup.ID);
    const isOldSetup = dbSetup && isDbSetup(dbSetup);

    const existedWeapon = Array_.findById(userWps, weapon.ID);
    const weaponCore = Weapon.serialize(weapon);

    if (existedWeapon) {
      if (isEqual(weaponCore, Weapon.serialize(existedWeapon))) {
        // Core not changed => add setupID to existedWeapon
        const newSetupIDs = existedWeapon.setupIDs || [];

        if (!newSetupIDs.includes(setup.ID)) {
          dispatch(
            updateDbWeapon({
              ID: existedWeapon.ID,
              setupIDs: newSetupIDs.concat(setup.ID),
            })
          );
        }
      } else {
        // Core changed => Duplicate existedWeapon and add it along with setupID
        weaponID = seedID++;

        dispatch(
          addDbWeapon({
            ...weaponCore,
            ID: weaponID,
            owner: undefined,
            setupIDs: [setup.ID],
          })
        );

        // Remove setupID from existed weapon
        dispatch(
          updateDbWeapon({
            ID: existedWeapon.ID,
            setupIDs: existedWeapon.setupIDs?.filter((ID) => ID !== setup.ID),
          })
        );
      }
    } else {
      // Weapon not found => Add new weapon with setupID
      dispatch(
        addDbWeapon({
          ...weaponCore,
          setupIDs: [setup.ID],
        })
      );

      if (isOldSetup) {
        // Remove setupID from the setup's old weapon
        const oldWeapon = Array_.findById(userWps, dbSetup.main.weaponID);

        if (oldWeapon) {
          dispatch(
            updateDbWeapon({
              ID: oldWeapon.ID,
              setupIDs: oldWeapon.setupIDs?.filter((ID) => ID !== setup.ID),
            })
          );
        }
      }
    }

    const pieces = atfGear.pieces.list();
    const artifactIDs = pieces.map((piece) => piece.ID);
    const newPieceIds: Partial<Record<ArtifactType, number>> = {};

    pieces.forEach((piece, pieceIndex) => {
      const existedPiece = Array_.findById(userArts, piece.ID);
      const pieceCore = piece.extractCore();

      if (existedPiece) {
        if (isEqual(pieceCore, Artifact.extractCore(existedPiece))) {
          // Core not changed => add setupID to existedArtifact
          const newSetupIDs = existedPiece.setupIDs || [];

          if (!newSetupIDs.includes(setup.ID)) {
            dispatch(
              updateDbArtifact({
                ID: existedPiece.ID,
                setupIDs: newSetupIDs.concat(setup.ID),
              })
            );
          }
        } else {
          // Core changed => Add new artifact with setupID
          const artifactID = seedID++;

          artifactIDs[pieceIndex] = artifactID;
          newPieceIds[piece.type] = artifactID;

          dispatch(
            addDbArtifact({
              ...pieceCore,
              ID: artifactID,
              setupIDs: [setup.ID],
            })
          );

          // Remove setupID from existed artifact
          dispatch(
            updateDbArtifact({
              ID: existedPiece.ID,
              setupIDs: existedPiece.setupIDs?.filter((ID) => ID !== setup.ID),
            })
          );
        }
      } else {
        // Artifact not found => Add new artifact with setupID
        dispatch(
          addDbArtifact({
            ...pieceCore,
            setupIDs: [setup.ID],
          })
        );

        if (isOldSetup) {
          // Remove setupID from the setup's old artifact
          const oldArtifactIDs = dbSetup.main.artifactIDs;
          const oldArtifactID = oldArtifactIDs[pieceIndex];
          const oldArtifact = oldArtifactID ? Array_.findById(userArts, oldArtifactID) : undefined;

          if (oldArtifact) {
            dispatch(
              updateDbArtifact({
                ID: oldArtifact.ID,
                setupIDs: oldArtifact.setupIDs?.filter((ID) => ID !== setup.ID),
              })
            );
          }
        }
      }
    });

    const newDbSetup = toDbSetup(setup, { name });

    newDbSetup.main.weaponID = weaponID;
    newDbSetup.main.artifactIDs = artifactIDs;

    dispatch(saveSetup(newDbSetup));

    updateSetupAfterSave(setup.ID, weaponID, newPieceIds);

    updateUI({ setupDirectorActive: false });
  };
}
