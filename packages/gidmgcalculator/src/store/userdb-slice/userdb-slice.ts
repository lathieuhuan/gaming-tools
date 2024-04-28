import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ARTIFACT_TYPES, WeaponType } from "@Backend";

import type { UserArtifact, UserCharacter, UserComplexSetup, UserSetup, UserWeapon } from "@Src/types";
import type {
  AddSetupToComplexAction,
  AddUserDatabaseAction,
  CombineSetupsAction,
  RemoveArtifactAction,
  RemoveWeaponAction,
  SaveSetupAction,
  SwitchArtifactAction,
  SwitchShownSetupInComplexAction,
  SwitchWeaponAction,
  UnequipArtifactAction,
  UpdateUserArtifactAction,
  UpdateUserArtifactSubStatAction,
  UpdateUserCharacterAction,
  UpdateUserWeaponAction,
} from "./userdb-slice.types";

import { $AppData } from "@Src/services";
import { findById, findByName, indexById, indexByName, Character_, Weapon_, Setup_, splitLv } from "@Src/utils";

export type UserdbState = {
  userChars: UserCharacter[];
  userWps: UserWeapon[];
  userArts: UserArtifact[];
  userSetups: (UserSetup | UserComplexSetup)[];
  chosenChar: string;
  chosenSetupID: number;
};

export const initialState: UserdbState = {
  userChars: [],
  userWps: [],
  userArts: [],
  userSetups: [],
  chosenChar: "",
  chosenSetupID: 0,
};

export const userdbSlice = createSlice({
  name: "userdb",
  initialState,
  reducers: {
    addUserDatabase: (state, action: AddUserDatabaseAction) => {
      const { characters = [], weapons = [], artifacts = [], setups = [] } = action.payload;
      state.userChars = characters;
      state.userWps = weapons;
      state.userArts = artifacts;
      state.userSetups = setups;

      if (characters.length) {
        state.chosenChar = characters[0].name;
      }
      if (setups.length) {
        const firstSetup = setups.find((setup) => setup.type !== "combined");

        if (firstSetup) {
          if (firstSetup.type === "original") {
            state.chosenSetupID = firstSetup.ID;
          } else if (firstSetup.type === "complex") {
            state.chosenSetupID = firstSetup.shownID;
          }
        }
      }
    },
    // CHARACTER
    addCharacter: (state, action: PayloadAction<{ name: string; weaponType: WeaponType }>) => {
      const { name, weaponType } = action.payload;
      const weaponID = Date.now();

      state.userChars.push({
        ...Character_.create(name),
        weaponID,
        artifactIDs: [null, null, null, null, null],
      });
      state.userWps.unshift({
        owner: name,
        ...Weapon_.create({ type: weaponType }, weaponID),
      });
    },
    viewCharacter: (state, action: PayloadAction<string>) => {
      state.chosenChar = action.payload;
    },
    sortCharacters: (state, action: PayloadAction<number[]>) => {
      state.userChars = action.payload.map((index) => state.userChars[index]);
    },
    updateUserCharacter: (state, action: UpdateUserCharacterAction) => {
      const { name, ...newInfo } = action.payload;
      const charIndex = indexByName(state.userChars, name);

      if (charIndex !== -1) {
        state.userChars[charIndex] = {
          ...state.userChars[charIndex],
          ...newInfo,
        };
      }
    },
    removeUserCharacter: (state, action: PayloadAction<string>) => {
      const { userChars, userWps, userArts } = state;
      const name = action.payload;
      let charIndex = indexByName(userChars, name);
      const char = userChars[charIndex];

      if (char) {
        const { weaponID, artifactIDs } = char;
        const wpInfo = findById(userWps, weaponID);
        if (wpInfo) {
          wpInfo.owner = null;
        }
        for (const id of artifactIDs) {
          if (id) {
            const artInfo = findById(userArts, id);
            if (artInfo) {
              artInfo.owner = null;
            }
          }
        }
        userChars.splice(charIndex, 1);
        if (charIndex === userChars.length) {
          charIndex--;
        }
        state.chosenChar = userChars[charIndex]?.name || "";
      }
    },
    switchWeapon: ({ userWps, userChars }, action: SwitchWeaponAction) => {
      const { newOwner, newID, oldOwner, oldID } = action.payload;

      const newWeaponInfo = findById(userWps, newID);
      if (newWeaponInfo) {
        newWeaponInfo.owner = oldOwner;
      }

      const oldWeaponInfo = findById(userWps, oldID);
      if (oldWeaponInfo) {
        oldWeaponInfo.owner = newOwner;
      }

      const oldOwnerInfo = findByName(userChars, oldOwner);
      if (oldOwnerInfo) {
        oldOwnerInfo.weaponID = newID;
      }

      const newOwnerInfo = newOwner ? findByName(userChars, newOwner) : undefined;
      if (newOwnerInfo) {
        newOwnerInfo.weaponID = oldID;
      }
    },
    switchArtifact: ({ userArts, userChars }, action: SwitchArtifactAction) => {
      const { newOwner, newID, oldOwner, oldID, artifactIndex } = action.payload;

      const newArtInfo = findById(userArts, newID);
      if (newArtInfo) {
        newArtInfo.owner = oldOwner;
      }

      const oldArtInfo = findById(userArts, oldID);
      if (oldArtInfo) {
        oldArtInfo.owner = newOwner;
      }

      const oldOwnerInfo = findByName(userChars, oldOwner);
      if (oldOwnerInfo) {
        oldOwnerInfo.artifactIDs[artifactIndex] = newID;
      }

      const newOwnerInfo = newOwner ? findByName(userChars, newOwner) : undefined;
      if (newOwnerInfo) {
        newOwnerInfo.artifactIDs[artifactIndex] = oldID;
      }
    },
    unequipArtifact: (state, action: UnequipArtifactAction) => {
      const { owner, artifactID, artifactIndex } = action.payload;
      const ownerInfo = owner ? findByName(state.userChars, owner) : undefined;
      const artifactInfo = findById(state.userArts, artifactID);

      if (ownerInfo && artifactInfo) {
        ownerInfo.artifactIDs[artifactIndex] = null;
        artifactInfo.owner = null;
      }
    },
    // WEAPON
    addUserWeapon: (state, action: PayloadAction<UserWeapon>) => {
      state.userWps.unshift(action.payload);
    },
    /** Require index (prioritized) or ID */
    updateUserWeapon: (state, action: UpdateUserWeaponAction) => {
      const { ID, ...newInfo } = action.payload;
      const weaponIndex = indexById(state.userWps, ID);

      if (weaponIndex !== -1) {
        state.userWps[weaponIndex] = {
          ...state.userWps[weaponIndex],
          ...newInfo,
        };
      }
    },
    swapWeaponOwner: (state, action: PayloadAction<{ newOwner: string; weaponID: number }>) => {
      const { userChars, userWps } = state;
      const { weaponID, newOwner } = action.payload;
      const weaponInfo = findById(userWps, weaponID);
      const newOwnerInfo = findByName(userChars, newOwner);

      if (weaponInfo && newOwnerInfo) {
        const newOwnerWeaponInfo = findById(userWps, newOwnerInfo.weaponID);
        const oldOwner = weaponInfo.owner;

        weaponInfo.owner = newOwner;
        newOwnerInfo.weaponID = weaponID;

        if (newOwnerWeaponInfo) {
          newOwnerWeaponInfo.owner = oldOwner;

          if (oldOwner) {
            const oldOwnerInfo = findByName(userChars, oldOwner);

            if (oldOwnerInfo) {
              oldOwnerInfo.weaponID = newOwnerWeaponInfo.ID;
            }
          }
        }
      }
    },
    sortWeapons: (state) => {
      state.userWps.sort((a, b) => {
        const rA = $AppData.getWeapon(a.code)?.rarity || 4;
        const rB = $AppData.getWeapon(b.code)?.rarity || 4;
        if (rA !== rB) {
          return rB - rA;
        }

        const [fA, sA] = splitLv(a);
        const [fB, sB] = splitLv(b);
        if (fA !== fB) {
          return fB - fA;
        }

        if (a.type !== b.type) {
          const type = {
            bow: 5,
            catalyst: 4,
            polearm: 3,
            claymore: 2,
            sword: 1,
          };
          return type[b.type] - type[a.type];
        }
        return sB - sA;
      });
    },
    removeWeapon: ({ userWps, userChars }, action: RemoveWeaponAction) => {
      const { ID, owner, type } = action.payload;
      const removedIndex = indexById(userWps, ID);

      if (removedIndex !== -1) {
        userWps.splice(removedIndex, 1);

        if (owner) {
          const newWpID = Date.now();

          userWps.unshift({
            owner,
            ...Weapon_.create({ type }, newWpID),
          });

          const ownerInfo = findByName(userChars, owner);
          if (ownerInfo) {
            ownerInfo.weaponID = newWpID;
          }
        }
      }
    },
    // ARTIFACT
    addUserArtifact: (state, action: PayloadAction<UserArtifact>) => {
      state.userArts.unshift(action.payload);
    },
    updateUserArtifact: (state, action: UpdateUserArtifactAction) => {
      const { ID, ...newInfo } = action.payload;
      const artifactIndex = indexById(state.userArts, ID);

      if (artifactIndex !== -1) {
        state.userArts[artifactIndex] = {
          ...state.userArts[artifactIndex],
          ...newInfo,
        };
      }
    },
    updateUserArtifactSubStat: (state, action: UpdateUserArtifactSubStatAction) => {
      const { ID, subStatIndex, ...newInfo } = action.payload;
      const artifact = findById(state.userArts, ID);
      if (artifact) {
        artifact.subStats[subStatIndex] = {
          ...artifact.subStats[subStatIndex],
          ...newInfo,
        };
      }
    },
    swapArtifactOwner: (state, action: PayloadAction<{ newOwner: string; artifactID: number }>) => {
      const { userChars, userArts } = state;
      const { artifactID, newOwner } = action.payload;
      const artifactInfo = findById(userArts, artifactID);
      const newOwnerInfo = findByName(userChars, newOwner);

      if (artifactInfo && newOwnerInfo) {
        const oldOwner = artifactInfo.owner;
        const { artifactIDs } = newOwnerInfo;
        const index = ARTIFACT_TYPES.indexOf(artifactInfo.type);

        artifactInfo.owner = newOwner;

        if (artifactIDs[index]) {
          const newOwnerArtifactInfo = findById(userArts, artifactIDs[index]);

          if (newOwnerArtifactInfo) {
            newOwnerArtifactInfo.owner = oldOwner;
          }
        }
        if (oldOwner) {
          const oldOwnerInfo = findByName(userChars, oldOwner);

          if (oldOwnerInfo) {
            oldOwnerInfo.artifactIDs[index] = artifactIDs[index];
          }
        }
        artifactIDs[index] = artifactID;
      }
    },
    sortArtifacts: (state) => {
      state.userArts.sort((a, b) => {
        if (a.level !== b.level) {
          return b.level - a.level;
        }
        if (a.type !== b.type) {
          const type = {
            flower: 5,
            plume: 4,
            sands: 3,
            goblet: 2,
            circlet: 1,
          };
          return type[b.type] - type[a.type];
        }
        const aName = $AppData.getArtifactSet(a.code)?.name || "";
        const bName = $AppData.getArtifactSet(b.code)?.name || "";
        return bName.localeCompare(aName);
      });
    },
    removeArtifact: ({ userArts, userChars }, action: RemoveArtifactAction) => {
      const { ID, owner, type } = action.payload;
      const removedIndex = indexById(userArts, ID);

      if (removedIndex !== -1) {
        userArts.splice(removedIndex, 1);
        const ownerInfo = owner ? findByName(userChars, owner) : undefined;

        if (ownerInfo) {
          const artIndex = ARTIFACT_TYPES.indexOf(type);
          ownerInfo.artifactIDs[artIndex] = null;
        }
      }
    },
    // SETUP
    chooseUserSetup: (state, action: PayloadAction<number>) => {
      state.chosenSetupID = action.payload;
    },
    saveSetup: (state, action: SaveSetupAction) => {
      const { userSetups } = state;
      const { ID, name, data } = action.payload;
      const existed = findById(userSetups, ID);
      let newChosenID;

      if (existed?.type === "combined") {
        for (const setup of userSetups) {
          if (setup.type === "complex" && setup.allIDs[existed.char.name] === ID) {
            newChosenID = setup.ID;
            setup.shownID = ID;
            break;
          }
        }
      }

      const newSetup = {
        ID,
        type: existed ? (existed.type as "original" | "combined") : "original",
        name,
        ...data,
      };

      if (existed) {
        userSetups[indexById(userSetups, ID)] = newSetup;
      } else {
        userSetups.unshift(newSetup);
      }

      state.chosenSetupID = newChosenID || ID;
    },
    removeSetup: (state, action: PayloadAction<number>) => {
      const removedID = action.payload;
      const { userSetups, userWps, userArts } = state;
      const removedIndex = indexById(userSetups, removedID);

      if (removedIndex !== -1) {
        const visibleIDs = userSetups.reduce((result: number[], setup) => {
          if (setup.type !== "combined") {
            result.push(setup.ID);
          }
          return result;
        }, []);
        const setup = userSetups[removedIndex];

        // Disconnect weapon & artifacts from removed setup
        if (Setup_.isUserSetup(setup)) {
          const { weaponID, artifactIDs } = setup;
          const foundWeapon = findById(userWps, weaponID);

          if (foundWeapon) {
            foundWeapon.setupIDs = foundWeapon.setupIDs?.filter((ID) => ID !== removedID);
          }

          for (const ID of artifactIDs) {
            if (!ID) continue;
            const foundArtifact = findById(userArts, ID);

            if (foundArtifact) {
              foundArtifact.setupIDs = foundArtifact.setupIDs?.filter((ID) => ID !== removedID);
            }
          }
        }

        userSetups.splice(removedIndex, 1);

        // Choose new setup
        const removedIndexInVisible = visibleIDs.indexOf(removedID);
        const lastIndex = visibleIDs.length - 1;

        state.chosenSetupID =
          removedIndexInVisible === lastIndex ? visibleIDs[lastIndex - 1] || 0 : visibleIDs[removedIndexInVisible + 1];
      }
    },
    combineSetups: (state, action: CombineSetupsAction) => {
      const { pickedIDs, name } = action.payload;
      const { userSetups } = state;
      const allIDs: Record<string, number> = {};
      const ID = Date.now();

      for (const ID of pickedIDs) {
        const setup = findById(userSetups, ID);

        if (setup) {
          setup.type = "combined";

          if (Setup_.isUserSetup(setup)) {
            allIDs[setup.char.name] = ID;
          }
        }
      }

      userSetups.unshift({
        name,
        ID,
        type: "complex",
        shownID: pickedIDs[0],
        allIDs,
      });
      state.chosenSetupID = ID;
    },
    switchShownSetupInComplex: (state, action: SwitchShownSetupInComplexAction) => {
      const { complexID, shownID } = action.payload;
      const complexSetup = findById(state.userSetups, complexID);

      if (complexSetup && !Setup_.isUserSetup(complexSetup)) {
        complexSetup.shownID = shownID;
      }
    },
    addSetupToComplex: ({ userSetups }, action: AddSetupToComplexAction) => {
      const { complexID, pickedIDs } = action.payload;
      const complexSetup = userSetups.find(
        (setup) => setup.ID === complexID && setup.type === "complex"
      ) as UserComplexSetup;

      if (complexSetup) {
        pickedIDs.forEach((ID) => {
          const setup = findById(userSetups, ID);

          if (setup && Setup_.isUserSetup(setup)) {
            setup.type = "combined";
            complexSetup.allIDs[setup.char.name] = ID;
          }
        });
      }
    },
    uncombineSetups: ({ userSetups }, action: PayloadAction<number>) => {
      const index = indexById(userSetups, action.payload);
      const targetSetup = userSetups[index];

      if (targetSetup && !Setup_.isUserSetup(targetSetup)) {
        for (const ID of Object.values(targetSetup.allIDs)) {
          const combinedSetup = findById(userSetups, ID);

          if (combinedSetup) {
            combinedSetup.type = "original";
          }
        }
        userSetups.splice(index, 1);
      }
    },
  },
});

export const {
  addUserDatabase,
  addCharacter,
  viewCharacter,
  sortCharacters,
  updateUserCharacter,
  removeUserCharacter,
  switchWeapon,
  switchArtifact,
  unequipArtifact,
  addUserWeapon,
  swapWeaponOwner,
  updateUserWeapon,
  sortWeapons,
  removeWeapon,
  addUserArtifact,
  updateUserArtifact,
  updateUserArtifactSubStat,
  swapArtifactOwner,
  sortArtifacts,
  removeArtifact,
  chooseUserSetup,
  saveSetup,
  removeSetup,
  combineSetups,
  switchShownSetupInComplex,
  addSetupToComplex,
  uncombineSetups,
} = userdbSlice.actions;

export default userdbSlice.reducer;
