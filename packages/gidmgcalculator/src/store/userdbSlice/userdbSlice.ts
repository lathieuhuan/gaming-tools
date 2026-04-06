import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Array_ } from "ron-utils";

import type {
  ArtifactType,
  IDbCharacter,
  IDbComplexSetup,
  IDbSetup,
  RawArtifact,
  RawWeapon,
} from "@/types";
import type { WritableDraft } from "immer/src/internal.js";
import type {
  AddDbCharacterAction,
  AddSetupToComplexAction,
  AddUserDatabaseAction,
  CombineSetupsAction,
  DbItemSortPayload,
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
} from "./types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { createCharacter, createWeapon } from "@/logic/entity.logic";
import { isDbSetup } from "@/logic/setup.logic";
import { Artifact, Ascendable, Weapon } from "@/models";

export type UserdbState = {
  userChars: IDbCharacter[];
  userWps: RawWeapon[];
  userArts: RawArtifact[];
  userSetups: (IDbSetup | IDbComplexSetup)[];
  chosenChar: number;
  chosenSetupID: number;
};

export const initialState: UserdbState = {
  userChars: [],
  userWps: [],
  userArts: [],
  userSetups: [],
  chosenChar: -1,
  chosenSetupID: 0,
};

export const userdbSlice = createSlice({
  name: "userdb",
  initialState,
  reducers: {
    addUserDatabase: (state, action: AddUserDatabaseAction) => {
      const { characters = [], weapons = [], artifacts = [], setups = [] } = action.payload;
      state.userChars = characters;
      state.userWps = weapons.map((weapon) => Weapon.serialize(weapon));
      state.userArts = artifacts.map((artifact) => Artifact.serialize(artifact));
      state.userSetups = setups;

      if (characters.length) {
        state.chosenChar = characters[0].code;
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
    addDbCharacter: (state, action: AddDbCharacterAction) => {
      const { code, weaponID, artifactIDs = [], data, ...characterState } = action.payload;

      const character = createCharacter({ code }, data, { state: characterState });

      const foundIndex = state.userChars.findIndex((char) => char.code === code);
      const dbCharacter: IDbCharacter = {
        ...character.serialize(),
        weaponID: weaponID || Date.now(),
        artifactIDs,
      };

      if (foundIndex !== -1) {
        state.userChars[foundIndex] = dbCharacter;
      } else {
        state.userChars.push(dbCharacter);
      }

      if (!weaponID) {
        const weapon = createWeapon({
          ID: dbCharacter.weaponID,
          type: character.data.weaponType,
          owner: code,
        });

        state.userWps.push(weapon.serialize());
      }
    },
    viewDbCharacter: (state, action: PayloadAction<number>) => {
      state.chosenChar = action.payload;
    },
    sortDbCharacters: (state, action: PayloadAction<number[]>) => {
      state.userChars = action.payload.map((index) => state.userChars[index]);
    },
    updateDbCharacter: (state, action: UpdateDbCharacterAction) => {
      const { code, ...newInfo } = action.payload;
      const charIndex = state.userChars.findIndex((char) => char.code === code);

      if (charIndex !== -1) {
        state.userChars[charIndex] = {
          ...state.userChars[charIndex],
          ...newInfo,
        };
      }
    },
    removeDbCharacter: (state, action: PayloadAction<number>) => {
      const { userChars, userWps, userArts } = state;
      const code = action.payload;
      let charIndex = userChars.findIndex((char) => char.code === code);
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

        state.chosenChar = userChars[charIndex]?.code || -1;
      }
    },
    switchWeapon: ({ userWps, userChars }, action: SwitchWeaponAction) => {
      const { targetOwner, targetId, currentOwner, currentId } = action.payload;

      const targetWp = Array_.findById(userWps, targetId);
      if (targetWp) {
        targetWp.owner = currentOwner;
      }

      const currentWp = Array_.findById(userWps, currentId);
      if (currentWp) {
        currentWp.owner = targetOwner;
      }

      const character = Array_.findByCode(userChars, currentOwner);
      if (character) {
        character.weaponID = targetId;
      }

      const targetWpOwner = Array_.findByCode(userChars, targetOwner);
      if (targetWpOwner) {
        targetWpOwner.weaponID = currentId;
      }
    },
    switchArtifact: ({ userArts, userChars }, action: SwitchArtifactAction) => {
      const { targetOwner, targetId, currentOwner, currentId } = action.payload;

      let targetAtf: WritableDraft<RawArtifact> | undefined;
      let currentAtf: WritableDraft<RawArtifact> | undefined;

      if (currentId) {
        for (const artifact of userArts) {
          if (artifact.ID === targetId) {
            targetAtf = artifact;
          }
          if (artifact.ID === currentId) {
            currentAtf = artifact;
          }
          if (targetAtf && currentAtf) {
            break;
          }
        }
      } else {
        targetAtf = Array_.findById(userArts, targetId);
      }

      if (targetAtf) {
        targetAtf.owner = currentOwner;
      }
      if (currentAtf) {
        currentAtf.owner = targetOwner;
      }

      const character = Array_.findByCode(userChars, currentOwner);
      if (character) {
        const newArtifactIDs = new Set<number | undefined>(character.artifactIDs);

        newArtifactIDs.delete(currentId);
        newArtifactIDs.add(targetId);

        character.artifactIDs = Array_.truthify(Array.from(newArtifactIDs));
      }

      const targetAtfOwner = Array_.findByCode(userChars, targetOwner);
      if (targetAtfOwner) {
        const newArtifactIDs = new Set<number | undefined>(targetAtfOwner.artifactIDs);

        newArtifactIDs.delete(targetId);
        newArtifactIDs.add(currentId);

        targetAtfOwner.artifactIDs = Array_.truthify(Array.from(newArtifactIDs));
      }
    },
    unequipArtifact: (state, action: PayloadAction<number>) => {
      const artifactID = action.payload;
      const artifact = Array_.findById(state.userArts, artifactID);

      if (!artifact) {
        return;
      }

      const owner = Array_.findByCode(state.userChars, artifact.owner);

      if (owner) {
        owner.artifactIDs = owner.artifactIDs.filter((id) => id !== artifactID);
      }

      delete artifact.owner;
    },
    // WEAPON
    addDbWeapon: (state, action: PayloadAction<RawWeapon>) => {
      state.userWps.push(Weapon.serialize(action.payload));
    },
    /** Require index (prioritized) or ID */
    updateDbWeapon: (state, action: UpdateDbWeaponAction) => {
      const { ID, ...newInfo } = action.payload;
      const weaponIndex = Array_.indexById(state.userWps, ID);

      if (weaponIndex !== -1) {
        state.userWps[weaponIndex] = Weapon.serialize({
          ...state.userWps[weaponIndex],
          ...newInfo,
        });
      }
    },
    swapWeaponOwner: (state, action: PayloadAction<{ newOwner: number; weaponID: number }>) => {
      const { userChars, userWps } = state;
      const { weaponID, newOwner } = action.payload;
      const weaponInfo = Array_.findById(userWps, weaponID);
      const newOwnerInfo = Array_.findByCode(userChars, newOwner);

      if (weaponInfo && newOwnerInfo) {
        const newOwnerWeaponInfo = Array_.findById(userWps, newOwnerInfo.weaponID);
        const oldOwner = weaponInfo.owner;

        weaponInfo.owner = newOwner;
        newOwnerInfo.weaponID = weaponID;

        if (newOwnerWeaponInfo) {
          newOwnerWeaponInfo.owner = oldOwner;

          if (oldOwner) {
            const oldOwnerInfo = Array_.findByCode(userChars, oldOwner);

            if (oldOwnerInfo) {
              oldOwnerInfo.weaponID = newOwnerWeaponInfo.ID;
            }
          }
        }
      }
    },
    sortDbWeapons: (state, action: PayloadAction<DbItemSortPayload>) => {
      const { option, direction } = action.payload;
      const isAsc = direction === "asc";

      switch (option) {
        case "time_added":
          state.userWps.sort((a, b) => {
            return isAsc ? a.ID - b.ID : b.ID - a.ID;
          });
          break;
        case "level":
          state.userWps.sort((a, b) => {
            const { bareLv: lvA, ascension: ascA } = Ascendable.splitLevel(a.level);
            const { bareLv: lvB, ascension: ascB } = Ascendable.splitLevel(b.level);

            if (lvA !== lvB) {
              return isAsc ? lvA - lvB : lvB - lvA;
            }

            return isAsc ? ascA - ascB : ascB - ascA;
          });
          break;
        // old code has sort by rarity, and type
      }
    },
    removeDbWeapon: ({ userWps, userChars }, action: RemoveDbWeaponAction) => {
      const { ID } = action.payload;
      const removedIndex = Array_.indexById(userWps, ID);

      if (removedIndex !== -1) {
        const { owner, type } = userWps[removedIndex];
        const ownerInfo = Array_.findByCode(userChars, owner);

        userWps.splice(removedIndex, 1);

        if (ownerInfo) {
          const newWeapon = createWeapon({ type, owner });

          userWps.push(newWeapon.serialize());
          ownerInfo.weaponID = newWeapon.ID;
        }
      }
    },
    // ARTIFACT
    addDbArtifact: (state, action: PayloadAction<RawArtifact | RawArtifact[]>) => {
      for (const artifact of Array_.toArray(action.payload)) {
        state.userArts.push(Artifact.serialize(artifact));
      }
    },
    updateDbArtifact: (state, action: UpdateDbArtifactAction) => {
      const { ID, ...newInfo } = action.payload;
      const artifactIndex = Array_.indexById(state.userArts, ID);

      if (artifactIndex !== -1) {
        state.userArts[artifactIndex] = Artifact.serialize({
          ...state.userArts[artifactIndex],
          ...newInfo,
        });
      }
    },
    updateDbArtifactSubStat: (state, action: UpdateDbArtifactSubStatAction) => {
      const { ID, subStatIndex, ...newInfo } = action.payload;
      const artifact = Array_.findById(state.userArts, ID);
      if (artifact) {
        artifact.subStats[subStatIndex] = {
          ...artifact.subStats[subStatIndex],
          ...newInfo,
        };
      }
    },
    swapArtifactOwner: (state, action: PayloadAction<{ newOwner: number; artifactID: number }>) => {
      const { userChars, userArts } = state;
      const { artifactID, newOwner } = action.payload;
      const artifactInfo = Array_.findById(userArts, artifactID);
      const newOwnerInfo = Array_.findByCode(userChars, newOwner);

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
          const oldOwnerInfo = Array_.findByCode(userChars, oldOwner);

          if (oldOwnerInfo) {
            oldOwnerInfo.artifactIDs[index] = artifactIDs[index];
          }
        }
        artifactIDs[index] = artifactID;
      }
    },
    sortDbArtifacts: (state, action: PayloadAction<DbItemSortPayload>) => {
      const { option, direction } = action.payload;
      const isAsc = direction === "asc";

      switch (option) {
        case "time_added":
          state.userArts.sort((a, b) => {
            return isAsc ? a.ID - b.ID : b.ID - a.ID;
          });
          break;
        case "level":
          state.userArts.sort((a, b) => {
            return isAsc ? a.level - b.level : b.level - a.level;
          });
          break;
      }
    },
    removeDbArtifact: ({ userArts, userChars }, action: RemoveDbArtifactAction) => {
      const { ID } = action.payload;
      const removedIndex = Array_.indexById(userArts, ID);

      if (removedIndex !== -1) {
        const { owner } = userArts[removedIndex];
        const ownerInfo = Array_.findByCode(userChars, owner);

        userArts.splice(removedIndex, 1);

        if (ownerInfo) {
          ownerInfo.artifactIDs = ownerInfo.artifactIDs.filter((id) => id !== ID);
        }
      }
    },
    // SETUP
    viewDbSetup: (state, action: PayloadAction<number>) => {
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
      let newActiveId = data.ID;

      if (existed.type === "combined") {
        for (const setup of userSetups) {
          if (setup.type === "complex" && setup.allIDs[existed.main.code] === data.ID) {
            newActiveId = setup.ID;
            setup.shownID = data.ID;
            break;
          }
        }
      }

      userSetups[foundIndex] = data;

      state.chosenSetupID = newActiveId;
    },
    removeDbSetup: (state, action: PayloadAction<number>) => {
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
            allIDs[setup.main.code] = ID;
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
            complexSetup.allIDs[setup.main.code] = ID;
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
    fixV4MigrationError: (state) => {
      for (const setup of state.userSetups) {
        if (isDbSetup(setup)) {
          for (const teammate of setup.teammates) {
            if (teammate.artifact?.code === -1) {
              teammate.artifact = undefined;
            }
          }
        }
      }
    },
    fixMultipleEquippedWeapons: (state) => {
      const { userChars, userWps } = state;

      const validWeaponsByChar = new Map<number, number>();

      for (const char of userChars) {
        validWeaponsByChar.set(char.code, char.weaponID);
      }

      for (const weapon of userWps) {
        if (weapon.owner && validWeaponsByChar.get(weapon.owner) !== weapon.ID) {
          delete weapon.owner;
        }
      }
    },
    fixMultipleEquippedArtifacts: (state) => {
      const { userChars, userArts } = state;

      const artifactsByOwnerByType = new Map<number, Map<ArtifactType, RawArtifact>>();

      for (const artifact of userArts) {
        if (!artifact.owner) {
          continue;
        }

        const artifactsByOwner = artifactsByOwnerByType.get(artifact.owner);
        const exist = artifactsByOwner?.get(artifact.type);

        if (exist) {
          delete artifact.owner;
          continue;
        }

        if (artifactsByOwner) {
          artifactsByOwner.set(artifact.type, artifact);
          continue;
        }

        const newArtifactsByOwner = new Map<ArtifactType, RawArtifact>();

        newArtifactsByOwner.set(artifact.type, artifact);
        artifactsByOwnerByType.set(artifact.owner, newArtifactsByOwner);
      }

      for (const char of userChars) {
        const artifactsByOwner = artifactsByOwnerByType.get(char.code);

        if (!artifactsByOwner) {
          char.artifactIDs = [];
          continue;
        }

        const artifacts = Array.from(artifactsByOwner.values());
        const artifactIDs = new Set(artifacts.map((artifact) => artifact.ID));

        char.artifactIDs = Array_.truthify(Array.from(artifactIDs));
      }
    },
  },
});

export const {
  addUserDatabase,
  addDbCharacter,
  viewDbCharacter,
  sortDbCharacters,
  updateDbCharacter,
  removeDbCharacter,
  switchWeapon,
  switchArtifact,
  unequipArtifact,
  addDbWeapon,
  swapWeaponOwner,
  updateDbWeapon,
  sortDbWeapons,
  removeDbWeapon,
  addDbArtifact,
  updateDbArtifact,
  updateDbArtifactSubStat,
  swapArtifactOwner,
  sortDbArtifacts,
  removeDbArtifact,
  viewDbSetup,
  saveSetup,
  removeDbSetup,
  combineSetups,
  switchShownSetupInComplex,
  addSetupToComplex,
  uncombineSetups,
  fixV4MigrationError,
  fixMultipleEquippedWeapons,
  fixMultipleEquippedArtifacts,
} = userdbSlice.actions;

export default userdbSlice.reducer;
