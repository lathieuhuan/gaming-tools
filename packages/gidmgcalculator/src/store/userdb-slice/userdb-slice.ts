import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { WritableDraft } from "immer/src/internal.js";
import type {
  IArtifactBasic,
  IDbArtifact,
  IDbCharacter,
  IDbComplexSetup,
  IDbSetup,
  IDbWeapon,
} from "@/types";
import type {
  AddDbCharacterAction,
  AddSetupToComplexAction,
  AddUserDatabaseAction,
  CombineSetupsAction,
  RemoveDbArtifactAction,
  RemoveDbWeaponAction,
  SaveSetupAction,
  SwitchArtifactAction,
  SwitchShownSetupInComplexAction,
  SwitchWeaponAction,
  UpdateDbArtifactAction,
  UpdateDbArtifactSubStatAction,
  UpdateDbCharacterAction,
  UpdateDbWeaponAction,
} from "./userdb-slice.types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { Ascendable } from "@/models/base";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";
import { isDbSetup } from "@/utils/setup";
import { createCharacterBasic, createWeaponBasic } from "@/utils/entity";

export type UserdbState = {
  userChars: IDbCharacter[];
  userWps: IDbWeapon[];
  userArts: IDbArtifact[];
  userSetups: (IDbSetup | IDbComplexSetup)[];
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
    /** Overwrite if character already exists */
    addCharacter: (state, action: AddDbCharacterAction) => {
      const {
        name,
        weaponID,
        artifactIDs = [],
        data = $AppCharacter.get(name),
        ...defaultValues
      } = action.payload;

      const foundIndex = state.userChars.findIndex((char) => char.name === name);
      const newChar = {
        ...createCharacterBasic({ name, ...defaultValues }),
        weaponID: weaponID || Date.now(),
        artifactIDs,
      };

      if (foundIndex !== -1) {
        state.userChars[foundIndex] = newChar;
      } else {
        state.userChars.push(newChar);
      }

      if (!weaponID) {
        state.userWps.push({
          owner: name,
          ...createWeaponBasic({
            ID: newChar.weaponID,
            type: data.weaponType,
          }),
        });
      }
    },
    viewCharacter: (state, action: PayloadAction<string>) => {
      state.chosenChar = action.payload;
    },
    sortCharacters: (state, action: PayloadAction<number[]>) => {
      state.userChars = action.payload.map((index) => state.userChars[index]);
    },
    updateUserCharacter: (state, action: UpdateDbCharacterAction) => {
      const { name, ...newInfo } = action.payload;
      const charIndex = Array_.indexByName(state.userChars, name);

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
      let charIndex = Array_.indexByName(userChars, name);
      const character = userChars[charIndex];

      if (character) {
        const { weaponID, artifactIDs } = character;

        delete Array_.findById(userWps, weaponID)?.owner;

        for (const id of artifactIDs) {
          if (id) {
            delete Array_.findById(userArts, id)?.owner;
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

      const newWeaponInfo = Array_.findById(userWps, newID);
      if (newWeaponInfo) {
        newWeaponInfo.owner = oldOwner;
      }

      const oldWeaponInfo = Array_.findById(userWps, oldID);
      if (oldWeaponInfo) {
        oldWeaponInfo.owner = newOwner;
      }

      const oldOwnerInfo = Array_.findByName(userChars, oldOwner);
      if (oldOwnerInfo) {
        oldOwnerInfo.weaponID = newID;
      }

      const newOwnerInfo = newOwner ? Array_.findByName(userChars, newOwner) : undefined;
      if (newOwnerInfo) {
        newOwnerInfo.weaponID = oldID;
      }
    },
    switchArtifact: ({ userArts, userChars }, action: SwitchArtifactAction) => {
      const { newOwner, newID, oldOwner, oldID } = action.payload;

      let newAtf: WritableDraft<IArtifactBasic> | undefined;
      let oldAtf: WritableDraft<IArtifactBasic> | undefined;

      if (oldID) {
        for (const atf of userArts) {
          if (atf.ID === newID) {
            newAtf = atf;
          }
          if (atf.ID === oldID) {
            oldAtf = atf;
          }
          if (newAtf && oldAtf) {
            break;
          }
        }
      } else {
        newAtf = Array_.findById(userArts, newID);
      }

      if (newAtf) {
        newAtf.owner = oldOwner;
      }
      if (oldAtf) {
        oldAtf.owner = newOwner;
      }

      const oldChar = Array_.findByName(userChars, oldOwner);
      if (oldChar) {
        oldChar.artifactIDs = oldChar.artifactIDs.length
          ? oldChar.artifactIDs.map((id) => (id === oldID ? newID : id))
          : [newID];
        // remove null from old db
        oldChar.artifactIDs = Array_.truthify(oldChar.artifactIDs);
      }

      const newChar = Array_.findByName(userChars, newOwner);
      if (newChar) {
        newChar.artifactIDs = newChar.artifactIDs.map((id) => (id === oldID ? newID : id));
        // remove null from old db
        newChar.artifactIDs = Array_.truthify(newChar.artifactIDs);
      }
    },
    unequipArtifact: (state, action: PayloadAction<number>) => {
      const artifactID = action.payload;
      const artifact = Array_.findById(state.userArts, artifactID);

      if (!artifact) {
        return;
      }

      const owner = Array_.findByName(state.userChars, artifact.owner);

      if (owner) {
        owner.artifactIDs = owner.artifactIDs.filter((id) => id !== artifactID);
      }

      delete artifact.owner;
    },
    // WEAPON
    addUserWeapon: (state, action: PayloadAction<IDbWeapon>) => {
      state.userWps.push(action.payload);
    },
    /** Require index (prioritized) or ID */
    updateUserWeapon: (state, action: UpdateDbWeaponAction) => {
      const { ID, ...newInfo } = action.payload;
      const weaponIndex = Array_.indexById(state.userWps, ID);

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
      const weaponInfo = Array_.findById(userWps, weaponID);
      const newOwnerInfo = Array_.findByName(userChars, newOwner);

      if (weaponInfo && newOwnerInfo) {
        const newOwnerWeaponInfo = Array_.findById(userWps, newOwnerInfo.weaponID);
        const oldOwner = weaponInfo.owner;

        weaponInfo.owner = newOwner;
        newOwnerInfo.weaponID = weaponID;

        if (newOwnerWeaponInfo) {
          newOwnerWeaponInfo.owner = oldOwner;

          if (oldOwner) {
            const oldOwnerInfo = Array_.findByName(userChars, oldOwner);

            if (oldOwnerInfo) {
              oldOwnerInfo.weaponID = newOwnerWeaponInfo.ID;
            }
          }
        }
      }
    },
    sortWeapons: (state) => {
      state.userWps.sort((a, b) => {
        const rA = $AppWeapon.get(a.code)?.rarity || 4;
        const rB = $AppWeapon.get(b.code)?.rarity || 4;
        if (rA !== rB) {
          return rB - rA;
        }

        const { bareLv: lvA, ascension: ascA } = Ascendable.splitLevel(a.level);
        const { bareLv: lvB, ascension: ascB } = Ascendable.splitLevel(b.level);
        if (lvA !== lvB) {
          return lvB - lvA;
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

        return ascB - ascA;
      });
    },
    removeWeapon: ({ userWps, userChars }, action: RemoveDbWeaponAction) => {
      const { ID } = action.payload;
      const removedIndex = Array_.indexById(userWps, ID);

      if (removedIndex !== -1) {
        const { owner, type } = userWps[removedIndex];
        const ownerInfo = owner ? Array_.findByName(userChars, owner) : undefined;

        userWps.splice(removedIndex, 1);

        if (ownerInfo) {
          const newWeapon: IDbWeapon = {
            owner,
            ...createWeaponBasic({ type }),
          };

          userWps.push(newWeapon);
          ownerInfo.weaponID = newWeapon.ID;
        }
      }
    },
    // ARTIFACT
    addUserArtifact: (state, action: PayloadAction<IDbArtifact | IDbArtifact[]>) => {
      state.userArts.push(...Array_.toArray(action.payload));
    },
    updateUserArtifact: (state, action: UpdateDbArtifactAction) => {
      const { ID, ...newInfo } = action.payload;
      const artifactIndex = Array_.indexById(state.userArts, ID);

      if (artifactIndex !== -1) {
        state.userArts[artifactIndex] = {
          ...state.userArts[artifactIndex],
          ...newInfo,
        };
      }
    },
    updateUserArtifactSubStat: (state, action: UpdateDbArtifactSubStatAction) => {
      const { ID, subStatIndex, ...newInfo } = action.payload;
      const artifact = Array_.findById(state.userArts, ID);
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
      const artifactInfo = Array_.findById(userArts, artifactID);
      const newOwnerInfo = Array_.findByName(userChars, newOwner);

      if (artifactInfo && newOwnerInfo) {
        const oldOwner = artifactInfo.owner;
        const { artifactIDs } = newOwnerInfo;
        const index = ARTIFACT_TYPES.indexOf(artifactInfo.type);

        artifactInfo.owner = newOwner;

        if (artifactIDs[index]) {
          const newOwnerArtifactInfo = Array_.findById(userArts, artifactIDs[index]);

          if (newOwnerArtifactInfo) {
            newOwnerArtifactInfo.owner = oldOwner;
          }
        }
        if (oldOwner) {
          const oldOwnerInfo = Array_.findByName(userChars, oldOwner);

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
        const aName = $AppArtifact.getSet(a.code)?.name || "";
        const bName = $AppArtifact.getSet(b.code)?.name || "";
        return bName.localeCompare(aName);
      });
    },
    removeArtifact: ({ userArts, userChars }, action: RemoveDbArtifactAction) => {
      const { ID } = action.payload;
      const removedIndex = Array_.indexById(userArts, ID);

      if (removedIndex !== -1) {
        const { owner } = userArts[removedIndex];
        const ownerInfo = owner ? Array_.findByName(userChars, owner) : undefined;

        userArts.splice(removedIndex, 1);

        if (ownerInfo) {
          ownerInfo.artifactIDs = ownerInfo.artifactIDs.filter((id) => id !== ID);
        }
      }
    },
    // SETUP
    chooseUserSetup: (state, action: PayloadAction<number>) => {
      state.chosenSetupID = action.payload;
    },
    saveSetup: (state, action: SaveSetupAction) => {
      const { userSetups } = state;
      const data = action.payload;
      const foundIndex = Array_.indexById(userSetups, data.ID);

      if (foundIndex === -1) {
        userSetups.unshift({
          ...data,
          type: "original",
        });

        state.chosenSetupID = data.ID;
        return;
      }

      const existed = userSetups[foundIndex];
      let newChosenID = data.ID;

      if (existed.type === "combined") {
        for (const setup of userSetups) {
          if (setup.type === "complex" && setup.allIDs[existed.main.name] === data.ID) {
            newChosenID = setup.ID;
            setup.shownID = data.ID;
            break;
          }
        }
      }

      userSetups[foundIndex] = data;

      state.chosenSetupID = newChosenID;
    },
    removeSetup: (state, action: PayloadAction<number>) => {
      const removedID = action.payload;
      const { userSetups, userWps, userArts } = state;
      const removedIndex = Array_.indexById(userSetups, removedID);

      if (removedIndex !== -1) {
        const visibleIDs = userSetups.reduce((result: number[], setup) => {
          if (setup.type !== "combined") {
            result.push(setup.ID);
          }
          return result;
        }, []);
        const setup = userSetups[removedIndex];

        // Disconnect weapon & artifacts from removed setup
        if (isDbSetup(setup)) {
          const { weaponID, artifactIDs } = setup.main;
          const foundWeapon = Array_.findById(userWps, weaponID);

          if (foundWeapon) {
            foundWeapon.setupIDs = foundWeapon.setupIDs?.filter((ID) => ID !== removedID);
          }

          for (const ID of artifactIDs) {
            if (!ID) continue;
            const foundArtifact = Array_.findById(userArts, ID);

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
          removedIndexInVisible === lastIndex
            ? visibleIDs[lastIndex - 1] || 0
            : visibleIDs[removedIndexInVisible + 1];
      }
    },
    combineSetups: (state, action: CombineSetupsAction) => {
      const { pickedIDs, name } = action.payload;
      const { userSetups } = state;
      const allIDs: Record<string, number> = {};
      const ID = Date.now();

      for (const ID of pickedIDs) {
        const setup = Array_.findById(userSetups, ID);

        if (setup) {
          setup.type = "combined";

          if (isDbSetup(setup)) {
            allIDs[setup.main.name] = ID;
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
      const complexSetup = Array_.findById(state.userSetups, complexID);

      if (complexSetup && !isDbSetup(complexSetup)) {
        complexSetup.shownID = shownID;
      }
    },
    addSetupToComplex: ({ userSetups }, action: AddSetupToComplexAction) => {
      const { complexID, pickedIDs } = action.payload;
      const complexSetup = userSetups.find((setup) => setup.ID === complexID && !isDbSetup(setup));

      if (complexSetup && !isDbSetup(complexSetup)) {
        pickedIDs.forEach((ID) => {
          const setup = Array_.findById(userSetups, ID);

          if (setup && isDbSetup(setup)) {
            setup.type = "combined";
            complexSetup.allIDs[setup.main.name] = ID;
          }
        });
      }
    },
    uncombineSetups: ({ userSetups }, action: PayloadAction<number>) => {
      const index = Array_.indexById(userSetups, action.payload);
      const targetSetup = userSetups[index];

      if (targetSetup && !isDbSetup(targetSetup)) {
        for (const ID of Object.values(targetSetup.allIDs)) {
          const combinedSetup = Array_.findById(userSetups, ID);

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
