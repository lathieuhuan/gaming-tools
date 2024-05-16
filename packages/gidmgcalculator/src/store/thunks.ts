import { batch } from "react-redux";
import isEqual from "react-fast-compare";
import { message } from "rond";
import { ARTIFACT_TYPES } from "@Backend";

import type { CalcArtifacts, UserSetup, UserWeapon } from "@Src/types";
import type { AppThunk } from "./store";
import { MAX_USER_ARTIFACTS, MAX_USER_SETUPS, MAX_USER_WEAPONS } from "@Src/constants";
import { $AppArtifact, $AppCharacter, $AppSettings } from "@Src/services";

// Store
import { initNewSession, type InitNewSessionPayload } from "./calculator-slice";
import { updateSetupImportInfo, updateUI } from "./ui-slice";
import { addUserArtifact, addUserWeapon, saveSetup, updateUserArtifact, updateUserWeapon } from "./userdb-slice";

// Util
import { findById, findByCode, findByName, deepCopy, getAppDataError, Modifier_, Setup_, Utils_ } from "@Src/utils";
import { parseUserCharacter, type CharacterForInit } from "./store.utils";

type Option = {
  onSuccess?: () => void;
};
export function checkBeforeInitNewSession(payload: InitNewSessionPayload, options?: Option): AppThunk {
  return async (dispatch) => {
    const { char } = payload.calcSetup;
    const { onSuccess } = options || {};

    if ($AppCharacter.getStatus(char.name) === "fetched") {
      dispatch(initNewSession(payload));
      onSuccess?.();
    } else {
      dispatch(updateUI({ loading: true }));

      const response = await $AppCharacter.fetch(char.name);

      if (response.code === 200) {
        dispatch(initNewSession(payload));
        onSuccess?.();
      } else {
        message.error(getAppDataError("character", response.code));
      }

      dispatch(updateUI({ loading: false }));
    }
  };
}

export function initNewSessionWithCharacter(character: CharacterForInit): AppThunk {
  return (dispatch, getState) => {
    const { userWps, userArts } = getState().userdb;

    const ID = Date.now();
    const appChar = $AppCharacter.get(character.name);
    const data = parseUserCharacter({
      character,
      userWps,
      userArts,
      weaponType: appChar.weaponType,
      seedID: ID + 1,
    });
    const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(true, data.char.name);

    dispatch(
      checkBeforeInitNewSession({
        ID,
        calcSetup: {
          char: data.char,
          selfBuffCtrls: selfBuffCtrls,
          selfDebuffCtrls: selfDebuffCtrls,
          weapon: data.weapon,
          wpBuffCtrls: data.wpBuffCtrls,
          artifacts: data.artifacts,
          artBuffCtrls: data.artBuffCtrls,
          artDebuffCtrls: Modifier_.createArtifactDebuffCtrls(),
          party: [null, null, null],
          elmtModCtrls: Modifier_.createElmtModCtrls(),
          customBuffCtrls: [],
          customDebuffCtrls: [],
          customInfusion: { element: "phys" },
        },
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
    let excessType = "";

    if (userSetups.filter((setup) => setup.type !== "complex").length + 1 > MAX_USER_SETUPS) {
      excessType = "Setup";
    } else if (userWps.length + 1 > MAX_USER_WEAPONS) {
      excessType = "Weapon";
    } else if (userArts.length + 5 > MAX_USER_ARTIFACTS) {
      excessType = "Artifact";
    }

    if (excessType) {
      return message.error(`You're having to many ${excessType}s. Please remove some of them first.`);
    }

    const setup = calculator.setupsById[setupID];
    const { weapon, artifacts } = setup;
    let seedID = Date.now();
    let weaponID = weapon.ID;
    const artifactIDs = artifacts.map((artifact) => artifact?.ID ?? null);
    const userSetup = findById(userSetups, setupID);
    const existedWeapon = findById(userWps, weapon.ID);
    const isOldSetup = userSetup && Setup_.isUserSetup(userSetup);

    if (existedWeapon) {
      if (isEqual(weapon, Utils_.userItemToCalcItem(existedWeapon))) {
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
            Utils_.calcItemToUserItem(weapon, {
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
          Utils_.calcItemToUserItem(weapon, {
            setupIDs: [setupID],
          })
        )
      );

      if (isOldSetup) {
        // Remove setupID from the setup's old weapon
        const oldWeapon = findById(userWps, userSetup.weaponID);

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
      const existedArtifact = findById(userArts, artifact.ID);

      if (existedArtifact) {
        if (isEqual(artifact, Utils_.userItemToCalcItem(existedArtifact))) {
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
              Utils_.calcItemToUserItem(artifact, {
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
            Utils_.calcItemToUserItem(artifact, {
              setupIDs: [setupID],
            })
          )
        );

        if (isOldSetup) {
          // Remove setupID from the setup's old artifact
          const oldArtifactID = userSetup.artifactIDs[artifactIndex];
          const oldArtifact = oldArtifactID ? findById(userArts, oldArtifactID) : undefined;

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
      dispatch(
        updateUI({
          atScreen: "MY_SETUPS",
          setupDirectorActive: false,
        })
      );
    });
  };
}

interface MakeTeammateSetupArgs {
  setup: UserSetup;
  mainWeapon: UserWeapon;
  teammateIndex: number;
}
export function makeTeammateSetup({ setup, mainWeapon, teammateIndex }: MakeTeammateSetupArgs): AppThunk {
  return (dispatch, getState) => {
    const teammate = setup.party[teammateIndex];

    if (teammate) {
      const { userChars, userWps } = getState().userdb;
      const { weapon, artifact } = teammate;
      const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(true, teammate.name);
      let seedID = Date.now();

      const similarWeapon = findByCode(userWps, teammate.weapon.code);
      const actualWeapon = similarWeapon
        ? Utils_.userItemToCalcItem(similarWeapon)
        : Utils_.createWeapon(
            {
              code: weapon.code,
              type: weapon.type,
            },
            seedID++
          );

      let artifacts: CalcArtifacts = [null, null, null, null, null];

      if (artifact.code) {
        const { variants = [] } = $AppArtifact.getSet(artifact.code) || {};
        const maxRarity = variants[variants.length - 1];

        if (maxRarity) {
          artifacts = ARTIFACT_TYPES.map((type) => {
            return Utils_.createArtifact(
              {
                code: artifact.code,
                rarity: maxRarity,
                type,
              },
              seedID++
            );
          });
        }
      }

      const party = deepCopy(setup.party);
      const [tmBuffCtrls, tmDebuffCtrls] = Modifier_.createCharacterModCtrls(false, teammate.name);

      party[teammateIndex] = {
        name: setup.char.name,
        weapon: {
          code: mainWeapon.code,
          type: mainWeapon.type,
          refi: mainWeapon.refi,
          buffCtrls: Modifier_.createWeaponBuffCtrls(false, mainWeapon),
        },
        artifact: {
          code: 0,
          buffCtrls: [],
        },
        buffCtrls: tmBuffCtrls,
        debuffCtrls: tmDebuffCtrls,
      };

      dispatch(
        updateSetupImportInfo({
          ID: seedID++,
          name: "New setup",
          target: setup.target,
          calcSetup: {
            char: Utils_.createCharacter(teammate.name, findByName(userChars, teammate.name)),
            selfBuffCtrls,
            selfDebuffCtrls,
            weapon: actualWeapon,
            wpBuffCtrls: Modifier_.createWeaponBuffCtrls(true, actualWeapon),
            artifacts,
            artBuffCtrls: Modifier_.createArtifactBuffCtrls(true, { code: artifact.code }),
            artDebuffCtrls: Modifier_.createArtifactDebuffCtrls(),
            party,
            elmtModCtrls: Modifier_.createElmtModCtrls(),
            customBuffCtrls: [],
            customDebuffCtrls: [],
            customInfusion: { element: "phys" },
          },
        })
      );
    }
  };
}
