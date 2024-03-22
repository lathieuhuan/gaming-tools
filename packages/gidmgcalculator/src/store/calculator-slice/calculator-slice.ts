import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PartiallyOptional } from "rond";
import type { AttackElement, CalcSetupManageInfo, CalcWeapon, Character, Resonance, Target } from "@Src/types";
import type {
  CalculatorState,
  AddTeammateAction,
  UpdateSetupsAction,
  ChangeArtifactAction,
  ChangeModCtrlInputAction,
  ChangeTeammateModCtrlInputAction,
  ImportSetupAction,
  RemoveCustomModCtrlAction,
  ToggleModCtrlAction,
  ToggleTeammateModCtrlAction,
  UpdateArtifactAction,
  UpdateCalculatorAction,
  UpdateCalcSetupAction,
  UpdateCustomBuffCtrlsAction,
  UpdateCustomDebuffCtrlsAction,
  UpdateTeammateWeaponAction,
  UpdateTeammateArtifactAction,
  ApplySettingsAction,
  InitNewSessionPayload,
} from "./calculator-slice.types";

import { ATTACK_ELEMENTS, RESONANCE_ELEMENT_TYPES } from "@Src/constants";
import { $AppData, $AppCharacter, $AppSettings } from "@Src/services";

import { deepCopy, findById, toArray, findByIndex, Setup_, Calculation_, Modifier_, Weapon_ } from "@Src/utils";
import { calculate, getCharDataFromState } from "./calculator-slice.utils";

// const defaultChar = {
//   name: "Albedo",
//   ...createCharInfo(),
// };

const initialState: CalculatorState = {
  activeId: 0,
  standardId: 0,
  comparedIds: [],
  setupManageInfos: [],
  setupsById: {},
  resultById: {},
  target: Setup_.createTarget(),
};

export const calculatorSlice = createSlice({
  name: "calculator",
  initialState,
  reducers: {
    updateCalculator: (state, action: UpdateCalculatorAction) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    initNewSession: (state, action: PayloadAction<InitNewSessionPayload>) => {
      const { ID = Date.now(), name, type, calcSetup, target } = action.payload;

      state.setupManageInfos = [Setup_.getManageInfo({ ID, name, type })];
      state.setupsById = {
        [ID]: calcSetup,
      };
      // calculate will repopulate resultById
      state.resultById = {};
      state.activeId = ID;
      state.standardId = 0;
      state.comparedIds = [];
      $AppSettings.set({ charInfoIsSeparated: false });

      if (target) {
        state.target = target;
      }

      calculate(state);
    },
    importSetup: (state, action: ImportSetupAction) => {
      const { importInfo, shouldOverwriteChar, shouldOverwriteTarget } = action.payload;
      const { ID = Date.now(), type, name = "New setup", target, calcSetup } = importInfo;
      const { setupsById } = state;
      const { charInfoIsSeparated } = $AppSettings.get();

      if (shouldOverwriteChar && charInfoIsSeparated) {
        for (const setup of Object.values(setupsById)) {
          setup.char = calcSetup.char;
        }
      }
      if (shouldOverwriteTarget) {
        state.target = target;
      }

      state.setupManageInfos.push(Setup_.getManageInfo({ name, ID, type }));
      state.setupsById[ID] = calcSetup;
      state.activeId = ID;

      calculate(state, shouldOverwriteChar || shouldOverwriteTarget);
    },
    updateCalcSetup: (state, action: UpdateCalcSetupAction) => {
      const { setupId = state.activeId, ...newInfo } = action.payload;

      state.setupsById[setupId] = {
        ...state.setupsById[setupId],
        ...newInfo,
      };
      calculate(state, setupId !== state.activeId);
    },
    duplicateCalcSetup: (state, action: PayloadAction<number>) => {
      const sourceId = action.payload;
      const { comparedIds, setupManageInfos, setupsById } = state;

      if (setupsById[sourceId]) {
        const setupID = Date.now();
        let setupName = findById(setupManageInfos, sourceId)?.name;

        if (setupName) {
          setupName = Setup_.getCopyName(
            setupName,
            setupManageInfos.map(({ name }) => name)
          );
        }

        setupManageInfos.push({
          ID: setupID,
          name: setupName || "New Setup",
          type: "original",
        });
        setupsById[setupID] = setupsById[sourceId];

        if (comparedIds.includes(sourceId)) {
          state.comparedIds.push(setupID);
        }
        calculate(state, true);
      }
    },
    removeCalcSetup: (state, action: PayloadAction<number>) => {
      const setupId = action.payload;

      if (state.setupManageInfos.length > 1) {
        //
        state.setupManageInfos = state.setupManageInfos.filter((info) => info.ID !== setupId);
        delete state.setupsById[setupId];

        if (setupId === state.activeId) {
          state.activeId = state.setupManageInfos[0].ID;
        }

        state.comparedIds = state.comparedIds.filter((ID) => ID !== setupId);

        if (state.comparedIds.length === 1) {
          state.comparedIds = [];
        }
        if (setupId === state.standardId && state.comparedIds.length) {
          state.standardId = state.comparedIds[0];
        }
      }
    },
    // CHARACTER
    updateCharacter: (state, action: PayloadAction<Partial<Character>>) => {
      const { setupsById, target } = state;
      const { charInfoIsSeparated } = $AppSettings.get();
      const { level } = action.payload;

      if (level && target.level === 1) {
        target.level = Calculation_.getBareLv(level);
      }
      if (charInfoIsSeparated) {
        const currentSetup = setupsById[state.activeId];
        currentSetup.char = {
          ...currentSetup.char,
          ...action.payload,
        };
      } else {
        for (const setup of Object.values(setupsById)) {
          setup.char = {
            ...setup.char,
            ...action.payload,
          };
        }
      }
      calculate(state, !charInfoIsSeparated);
    },
    // PARTY
    addTeammate: (state, action: AddTeammateAction) => {
      const { name, elementType, weaponType, teammateIndex } = action.payload;
      const appChar = getCharDataFromState(state);
      const setup = state.setupsById[state.activeId];
      const { party, elmtModCtrls } = setup;

      const oldElmtCount = Calculation_.countElements($AppCharacter.getPartyData(party), appChar);
      const oldTeammate = party[teammateIndex];
      // assign to party
      party[teammateIndex] = Setup_.createTeammate({ name, weaponType });

      const newElmtCount = Calculation_.countElements($AppCharacter.getPartyData(party), appChar);

      if (oldTeammate) {
        const { vision: oldElement } = $AppCharacter.get(oldTeammate.name) || {};
        // lose a resonance
        if (
          oldElement &&
          RESONANCE_ELEMENT_TYPES.includes(oldElement) &&
          oldElmtCount[oldElement] === 2 &&
          newElmtCount[oldElement] === 1
        ) {
          elmtModCtrls.resonances = elmtModCtrls.resonances.filter((resonance) => {
            return resonance.vision !== oldElement;
          });
        }
      }
      // new teammate form new resonance
      if (
        RESONANCE_ELEMENT_TYPES.includes(elementType) &&
        oldElmtCount[elementType] === 1 &&
        newElmtCount[elementType] === 2
      ) {
        const newResonance = {
          vision: elementType,
          activated: ["pyro", "hydro", "dendro"].includes(elementType),
        } as Resonance;

        if (elementType === "dendro") {
          newResonance.inputs = [0, 0];
        }
        elmtModCtrls.resonances.push(newResonance);
      }

      calculate(state);
    },
    removeTeammate: (state, action: PayloadAction<number>) => {
      const teammateIndex = action.payload;
      const appChar = getCharDataFromState(state);
      const { party, elmtModCtrls } = state.setupsById[state.activeId];
      const teammate = party[teammateIndex];

      if (teammate) {
        const { vision: elementType } = $AppCharacter.get(teammate.name);
        party[teammateIndex] = null;
        const newElmtCount = Calculation_.countElements($AppCharacter.getPartyData(party), appChar);

        if (newElmtCount[elementType] === 1) {
          elmtModCtrls.resonances = elmtModCtrls.resonances.filter((resonance) => {
            return resonance.vision !== elementType;
          });
        }
        calculate(state);
      }
    },
    updateTeammateWeapon: (state, action: UpdateTeammateWeaponAction) => {
      const { teammateIndex, ...newWeaponInfo } = action.payload;
      const teammate = state.setupsById[state.activeId].party[teammateIndex];

      if (teammate) {
        teammate.weapon = {
          ...teammate.weapon,
          ...newWeaponInfo,
        };
        if (newWeaponInfo.code) {
          teammate.weapon.buffCtrls = Modifier_.createWeaponBuffCtrls(false, teammate.weapon);
        }
        calculate(state);
      }
    },
    updateTeammateArtifact: (state, action: UpdateTeammateArtifactAction) => {
      const { teammateIndex, ...newArtifactInfo } = action.payload;
      const teammate = state.setupsById[state.activeId].party[teammateIndex];

      if (teammate) {
        const prevArtifactCode = teammate.artifact.code;

        teammate.artifact = {
          ...teammate.artifact,
          ...newArtifactInfo,
        };
        if (newArtifactInfo.code) {
          if (newArtifactInfo.code === -1) {
            const debuffArtifactCodes = $AppData.getAllArtifacts().reduce<number[]>((accumulator, artifact) => {
              if (artifact.debuffs?.length) {
                accumulator.push(artifact.code);
              }
              return accumulator;
            }, []);

            // Deactivate artifact that has debuff
            if (debuffArtifactCodes.includes(prevArtifactCode)) {
              const debuffArtifact = state.setupsById[state.activeId].artDebuffCtrls.find(
                (ctrl) => ctrl.code === prevArtifactCode
              );

              if (debuffArtifact) {
                debuffArtifact.activated = false;
              }
            }
            teammate.artifact.buffCtrls = [];
          } else {
            teammate.artifact.buffCtrls = Modifier_.createArtifactBuffCtrls(false, newArtifactInfo);
          }
        }
        calculate(state);
      }
    },
    toggleTeammateModCtrl: (state, action: ToggleTeammateModCtrlAction) => {
      const { teammateIndex, modCtrlName, ctrlIndex } = action.payload;
      const ctrl = findByIndex(state.setupsById[state.activeId].party[teammateIndex]?.[modCtrlName] || [], ctrlIndex);

      if (ctrl) {
        ctrl.activated = !ctrl.activated;
        calculate(state);
      }
    },
    changeTeammateModCtrlInput: (state, action: ChangeTeammateModCtrlInputAction) => {
      const { teammateIndex, modCtrlName, ctrlIndex, inputIndex, value } = action.payload;
      const ctrl = findByIndex(state.setupsById[state.activeId].party[teammateIndex]?.[modCtrlName] || [], ctrlIndex);

      if (ctrl && ctrl.inputs) {
        ctrl.inputs[inputIndex] = value;
        calculate(state);
      }
    },
    // WEAPON
    changeWeapon: (state, action: PayloadAction<CalcWeapon>) => {
      const weapon = action.payload;
      const setup = state.setupsById[state.activeId];
      setup.weapon = weapon;
      setup.wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, weapon);

      calculate(state);
    },
    updateWeapon: (state, action: PayloadAction<Partial<CalcWeapon>>) => {
      const currentSetup = state.setupsById[state.activeId];
      currentSetup.weapon = {
        ...currentSetup.weapon,
        ...action.payload,
      };
      calculate(state);
    },
    // ARTIFACTS
    changeArtifact: (state, action: ChangeArtifactAction) => {
      const { pieceIndex, newPiece, shouldKeepStats } = action.payload;
      const setup = state.setupsById[state.activeId];
      const piece = setup.artifacts[pieceIndex];
      const oldSetBonuses = Calculation_.getArtifactSetBonuses(setup.artifacts);
      const oldBonusLevel = oldSetBonuses[0]?.bonusLv;

      if (shouldKeepStats && piece && newPiece) {
        piece.code = newPiece.code;
        piece.rarity = newPiece.rarity;
      } else {
        setup.artifacts[pieceIndex] = newPiece;
      }

      const newSetBonus = Calculation_.getArtifactSetBonuses(setup.artifacts)[0];

      if (newSetBonus) {
        if (oldBonusLevel === 0 && newSetBonus.bonusLv) {
          setup.artBuffCtrls = Modifier_.createArtifactBuffCtrls(true, newSetBonus);
        } //
        else if (oldBonusLevel && !newSetBonus.bonusLv) {
          setup.artBuffCtrls = [];
        }
      }
      calculate(state);
    },
    updateArtifact: (state, action: UpdateArtifactAction) => {
      const { pieceIndex, level, mainStatType, subStat } = action.payload;
      const piece = state.setupsById[state.activeId].artifacts[pieceIndex];

      if (piece) {
        piece.level = level ?? piece.level;
        piece.mainStatType = mainStatType ?? piece.mainStatType;

        if (subStat) {
          const { index, newInfo } = subStat;
          piece.subStats[index] = {
            ...piece.subStats[index],
            ...newInfo,
          };
        }
      }
      calculate(state);
    },
    // MOD CTRLS
    updateResonance: (state, action: PayloadAction<PartiallyOptional<Resonance, "activated">>) => {
      const { vision, ...newInfo } = action.payload;
      const { resonances } = state.setupsById[state.activeId].elmtModCtrls;
      const targetIndex = resonances.findIndex((resonance) => resonance.vision === vision);

      if (targetIndex >= 0) {
        resonances[targetIndex] = {
          ...resonances[targetIndex],
          ...newInfo,
        };
        calculate(state);
      }
    },
    toggleModCtrl: (state, action: ToggleModCtrlAction) => {
      const { modCtrlName, ctrlIndex } = action.payload;
      const ctrl = findByIndex(state.setupsById[state.activeId][modCtrlName], ctrlIndex);

      if (ctrl) {
        ctrl.activated = !ctrl.activated;
        calculate(state);
      }
    },
    changeModCtrlInput: (state, action: ChangeModCtrlInputAction) => {
      const { modCtrlName, ctrlIndex, inputIndex, value } = action.payload;
      const ctrl = findByIndex(state.setupsById[state.activeId][modCtrlName], ctrlIndex);

      if (ctrl?.inputs) {
        ctrl.inputs[inputIndex] = value;
        calculate(state);
      }
    },
    // CUSTOM MOD CTRLS
    updateCustomBuffCtrls: (state, action: UpdateCustomBuffCtrlsAction) => {
      const { actionType, ctrls } = action.payload;
      const activeSetup = state.setupsById[state.activeId];

      switch (actionType) {
        case "ADD":
          activeSetup.customBuffCtrls.push(...toArray(ctrls));
          break;
        case "EDIT":
          for (const { index, ...newInfo } of toArray(ctrls)) {
            activeSetup.customBuffCtrls[index] = {
              ...activeSetup.customBuffCtrls[index],
              ...newInfo,
            };
          }
          break;
        case "REPLACE":
          activeSetup.customBuffCtrls = toArray(ctrls);
          break;
      }
      calculate(state);
    },
    updateCustomDebuffCtrls: (state, action: UpdateCustomDebuffCtrlsAction) => {
      const { actionType, ctrls } = action.payload;
      const activeSetup = state.setupsById[state.activeId];

      switch (actionType) {
        case "ADD":
          activeSetup.customDebuffCtrls.unshift(...toArray(ctrls));
          break;
        case "EDIT":
          for (const { index, ...newInfo } of toArray(ctrls)) {
            activeSetup.customDebuffCtrls[index] = {
              ...activeSetup.customDebuffCtrls[index],
              ...newInfo,
            };
          }
          break;
        case "REPLACE":
          activeSetup.customDebuffCtrls = toArray(ctrls);
          break;
      }
      calculate(state);
    },
    removeCustomModCtrl: (state, action: RemoveCustomModCtrlAction) => {
      const { isBuffs, ctrlIndex } = action.payload;
      const modCtrlName = isBuffs ? "customBuffCtrls" : "customDebuffCtrls";

      state.setupsById[state.activeId][modCtrlName].splice(ctrlIndex, 1);
      calculate(state);
    },
    // TARGET
    updateTarget: (state, action: PayloadAction<Partial<Target>>) => {
      state.target = {
        ...state.target,
        ...action.payload,
      };

      const { target } = state;
      const { variantType, inputs = [] } = target;
      const monster = $AppData.getMonster(target);

      // not update target if monster code === 0 (custom target)
      if (monster?.code) {
        const { resistance, variant } = monster;
        const { base, ...otherResistances } = resistance;
        const inputConfigs = monster.inputConfigs ? toArray(monster.inputConfigs) : [];

        for (const atkElmt of ATTACK_ELEMENTS) {
          target.resistances[atkElmt] = base;
        }
        for (const [key, value] of Object.entries(otherResistances)) {
          target.resistances[key as AttackElement] = value;
        }

        if (variantType && variant?.change) {
          target.resistances[variantType] += variant.change;
        }

        const updateResistances = ([key, value]: [string, number]) => {
          switch (key) {
            case "base":
              for (const attElmt of ATTACK_ELEMENTS) {
                target.resistances[attElmt] += value;
              }
              break;
            case "variant":
              if (target.variantType) {
                target.resistances[target.variantType] += value;
              }
              break;
            default:
              target.resistances[key as AttackElement] += value;
          }
        };

        inputs.forEach((input, index) => {
          const config = inputConfigs[index];
          if (!config) return;
          const { type = "CHECK" } = config;

          switch (type) {
            case "CHECK":
              if (input && config.changes) {
                Object.entries(config.changes).forEach(updateResistances);
              }
              break;
            case "SELECT":
              if (input !== -1 && config.options) {
                const option = config.options[input];

                if (typeof option === "string") {
                  if (config.optionChange) {
                    target.resistances[option] += config.optionChange;
                  }
                } else {
                  Object.entries(option.changes).forEach(updateResistances);
                }
              }
              break;
          }
        });
      }

      calculate(state, true);
    },
    updateSetups: (state, action: UpdateSetupsAction) => {
      const { newSetupManageInfos, newStandardId } = action.payload;
      const appChar = getCharDataFromState(state);
      const { setupManageInfos, setupsById, activeId } = state;
      const removedIds = [];
      // Reset comparedIds before repopulate with newSetupManageInfos
      state.comparedIds = [];

      const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(true, appChar.name);
      const newWeapon = Weapon_.create({ type: appChar.weaponType });
      const wpBuffCtrls = Modifier_.createWeaponBuffCtrls(true, newWeapon);
      const elmtModCtrls = Modifier_.createElmtModCtrls();
      const tempManageInfos: CalcSetupManageInfo[] = [];

      for (const { ID, name, status, originId, isCompared } of newSetupManageInfos) {
        isCompared && state.comparedIds.push(ID);
        const newSetupName = name.trim();

        switch (status) {
          case "REMOVED": {
            // Store to delete later coz they can be used for ref of DUPLICATE case
            removedIds.push(ID);
            break;
          }
          case "OLD": {
            const oldInfo = findById(setupManageInfos, ID);
            if (oldInfo) {
              tempManageInfos.push({
                ...oldInfo,
                name: newSetupName,
              });
            }
            break;
          }
          case "DUPLICATE": {
            if (originId && setupsById[originId]) {
              tempManageInfos.push({
                ID,
                name: newSetupName,
                type: "original",
              });
              setupsById[ID] = deepCopy(setupsById[originId]);
            }
            break;
          }
          case "NEW": {
            tempManageInfos.push({
              ID,
              name: newSetupName,
              type: "original",
            });
            setupsById[ID] = {
              char: setupsById[activeId].char,
              selfBuffCtrls,
              selfDebuffCtrls,
              weapon: newWeapon,
              wpBuffCtrls,
              artifacts: [null, null, null, null, null],
              artBuffCtrls: [],
              artDebuffCtrls: Modifier_.createArtifactDebuffCtrls(),
              party: [null, null, null],
              elmtModCtrls,
              customBuffCtrls: [],
              customDebuffCtrls: [],
              customInfusion: { element: "phys" },
            };
            break;
          }
        }
      }

      for (const ID of removedIds) {
        delete setupsById[ID];
        delete state.resultById[ID];
      }

      const activeSetup = findById(tempManageInfos, activeId);
      const newActiveId = activeSetup ? activeSetup.ID : tempManageInfos[0].ID;

      // if (state.configs.charInfoIsSeparated && !newConfigs.charInfoIsSeparated) {
      //   const activeChar = setupsById[newActiveId].char;

      //   for (const setup of Object.values(setupsById)) {
      //     setup.char = activeChar;
      //   }
      // }

      state.activeId = newActiveId;
      state.comparedIds = state.comparedIds.length === 1 ? [] : state.comparedIds;
      state.standardId = state.comparedIds.length ? newStandardId : 0;
      state.setupManageInfos = tempManageInfos;
      // state.configs = newConfigs;

      calculate(state, true);
    },
    applySettings: (state, action: ApplySettingsAction) => {
      const { doMergeCharInfo } = action.payload;
      const activeChar = state.setupsById[state.activeId]?.char;

      if (doMergeCharInfo && activeChar) {
        for (const setup of Object.values(state.setupsById)) {
          setup.char = activeChar;
        }
        calculate(state, true);
      }
    },
  },
});

export const {
  updateCalculator,
  initNewSession,
  importSetup,
  updateCalcSetup,
  duplicateCalcSetup,
  removeCalcSetup,
  updateCharacter,
  addTeammate,
  removeTeammate,
  updateTeammateWeapon,
  updateTeammateArtifact,
  changeWeapon,
  updateWeapon,
  updateArtifact,
  changeArtifact,
  updateResonance,
  toggleModCtrl,
  changeModCtrlInput,
  toggleTeammateModCtrl,
  changeTeammateModCtrlInput,
  updateCustomBuffCtrls,
  updateCustomDebuffCtrls,
  removeCustomModCtrl,
  updateTarget,
  updateSetups,
  applySettings,
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
