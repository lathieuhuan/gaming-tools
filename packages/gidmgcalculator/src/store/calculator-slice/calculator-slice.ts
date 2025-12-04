import { ATTACK_ELEMENTS, AttackElement } from "@Calculation";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PartiallyOptional } from "rond";

import type {
  CalcSetupManageInfo,
  CalcWeapon,
  Resonance,
  Target,
  TeamBuffCtrl,
  Teammate,
} from "@/types";
import type {
  AddTeammateAction,
  ApplySettingsAction,
  CalculatorState,
  ChangeArtifactAction,
  ChangeArtifactBuffCtrlInputAction,
  ChangeModCtrlInputAction,
  ChangeTeammateModCtrlInputAction,
  ImportSetupAction,
  InitNewSessionPayload,
  RemoveCustomModCtrlAction,
  ToggleArtifactBuffCtrlAction,
  ToggleModCtrlAction,
  ToggleTeammateModCtrlAction,
  UpdateArtifactAction,
  UpdateCalcSetupAction,
  UpdateCalculatorAction,
  UpdateCharacterAction,
  UpdateCustomBuffCtrlsAction,
  UpdateCustomDebuffCtrlsAction,
  UpdateSetupsAction,
  UpdateTeammateAction,
  UpdateTeammateArtifactAction,
  UpdateTeammateWeaponAction,
} from "./calculator-slice.types";

import { $AppArtifact, $AppCharacter, $AppData, $AppSettings } from "@/services";
import Array_ from "@/utils/Array";
import Entity_ from "@/utils/Entity";
import Modifier_ from "@/utils/Modifier";
import Object_ from "@/utils/Object";
import Setup_ from "@/utils/Setup";
import { calculate } from "./utils/calculate";
import { checkToUpdateResonance } from "./utils/checkToUpdateResonance";
import { checkToUpdateTeamBuffs } from "./utils/checkToUpdateTeamBuffs";

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
      $AppSettings.patch({ separateCharInfo: false });

      if (target) {
        state.target = target;
      }

      calculate(state);
    },
    importSetup: (state, action: ImportSetupAction) => {
      const { importInfo, shouldOverwriteChar, shouldOverwriteTarget } = action.payload;
      const { ID = Date.now(), type, name = "New setup", target, calcSetup } = importInfo;
      const { setupsById } = state;
      const { separateCharInfo } = $AppSettings.get();

      // TODO: check if condition separateCharInfo is correct
      if (shouldOverwriteChar && separateCharInfo) {
        for (const setup of Object.values(setupsById)) {
          setup.char = calcSetup.char;
        }
      }
      if (shouldOverwriteTarget && target) {
        state.target = target;
      }

      state.setupManageInfos.push(Setup_.getManageInfo({ name, ID, type }));
      state.setupsById[ID] = calcSetup;
      state.activeId = ID;

      calculate(state, shouldOverwriteChar || shouldOverwriteTarget);
    },
    updateCalcSetup: (state, action: UpdateCalcSetupAction) => {
      const { setupId = state.activeId, ...newInfo } = action.payload;

      Object.assign(state.setupsById[setupId], newInfo);
      calculate(state, setupId !== state.activeId);
    },
    duplicateCalcSetup: (state, action: PayloadAction<number>) => {
      const sourceId = action.payload;
      const { comparedIds, setupManageInfos, setupsById } = state;

      if (setupsById[sourceId]) {
        const setupID = Date.now();
        let setupName = Array_.findById(setupManageInfos, sourceId)?.name;

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
    updateCharacter: (state, action: UpdateCharacterAction) => {
      const { setupsById } = state;
      const { separateCharInfo } = $AppSettings.get();
      const { setupIds, ...newConfig } = action.payload;

      if (separateCharInfo) {
        if (setupIds) {
          for (const setupId of Array_.toArray(setupIds)) {
            Object.assign(setupsById[setupId].char, newConfig);
          }
        } else {
          Object.assign(setupsById[state.activeId].char, newConfig);
        }
      } else {
        for (const setup of Object.values(setupsById)) {
          Object.assign(setup.char, newConfig);
        }
      }
      calculate(state, !separateCharInfo || !!setupIds);
    },
    // PARTY
    addTeammate: (state, action: AddTeammateAction) => {
      const { name, weaponType, teammateIndex } = action.payload;
      const setup = state.setupsById[state.activeId];
      const { party } = setup;

      const appCharacters = Entity_.getAppCharacters(setup.char.name, party, name);

      // assign to party
      party[teammateIndex] = Setup_.createTeammate({ name, weaponType });

      checkToUpdateResonance(setup, appCharacters);
      checkToUpdateTeamBuffs(setup, appCharacters);
      calculate(state);
    },
    updateTeammate: (state, action: UpdateTeammateAction) => {
      const { teammateIndex, ...newInfo } = action.payload;
      const setup = state.setupsById[state.activeId];
      const teammate = setup.party[teammateIndex];

      if (teammate) {
        const appCharacters = Entity_.getAppCharacters(setup.char.name, setup.party);

        Object.assign(teammate, newInfo);
        checkToUpdateTeamBuffs(setup, appCharacters);
        calculate(state);
      }
    },
    removeTeammate: (state, action: PayloadAction<number>) => {
      const teammateIndex = action.payload;
      const setup = state.setupsById[state.activeId];
      const { char, party } = setup;

      const appCharacters = Entity_.getAppCharacters(char.name, party);

      // remove from party
      party[teammateIndex] = null;

      checkToUpdateResonance(setup, appCharacters);
      checkToUpdateTeamBuffs(setup, appCharacters);
      calculate(state);
    },
    updateTeammateWeapon: (state, action: UpdateTeammateWeaponAction) => {
      const { teammateIndex, ...newWeaponInfo } = action.payload;
      const teammate = state.setupsById[state.activeId].party[teammateIndex];

      if (teammate) {
        Object.assign(teammate.weapon, newWeaponInfo);

        if (newWeaponInfo.code) {
          teammate.weapon.buffCtrls = Modifier_.createWeaponBuffCtrls(teammate.weapon, false);
        }
        calculate(state);
      }
    },
    updateTeammateArtifact: (state, action: UpdateTeammateArtifactAction) => {
      const { teammateIndex, ...newArtifactInfo } = action.payload;
      const setup = state.setupsById[state.activeId];
      const teammate = setup.party[teammateIndex];

      if (teammate) {
        const prevArtifactCode = teammate.artifact.code;

        Object.assign(teammate.artifact, newArtifactInfo);

        if (newArtifactInfo.code) {
          if (newArtifactInfo.code === -1) {
            const debuffArtifactCodes = $AppArtifact
              .getAll()
              .reduce<number[]>((accumulator, artifact) => {
                if (artifact.debuffs?.length) {
                  accumulator.push(artifact.code);
                }
                return accumulator;
              }, []);

            // Deactivate artifact that has debuff
            if (debuffArtifactCodes.includes(prevArtifactCode)) {
              const debuffArtifact = setup.artDebuffCtrls.find(
                (ctrl) => ctrl.code === prevArtifactCode
              );

              if (debuffArtifact) {
                debuffArtifact.activated = false;
              }
            }
            teammate.artifact.buffCtrls = [];
          } else {
            teammate.artifact.buffCtrls = Modifier_.createArtifactBuffCtrls(newArtifactInfo, false);
          }
        }

        const appCharacters = Entity_.getAppCharacters(setup.char.name, setup.party);

        checkToUpdateTeamBuffs(setup, appCharacters);
        calculate(state);
      }
    },
    toggleTeammateModCtrl: (state, action: ToggleTeammateModCtrlAction) => {
      const { teammateIndex, modCtrlName, ctrlIndex } = action.payload;
      const ctrl = Array_.findByIndex(
        state.setupsById[state.activeId].party[teammateIndex]?.[modCtrlName],
        ctrlIndex
      );

      if (ctrl) {
        ctrl.activated = !ctrl.activated;
        calculate(state);
      }
    },
    changeTeammateModCtrlInput: (state, action: ChangeTeammateModCtrlInputAction) => {
      const { teammateIndex, modCtrlName, ctrlIndex, inputIndex, value } = action.payload;
      const ctrl = Array_.findByIndex(
        state.setupsById[state.activeId].party[teammateIndex]?.[modCtrlName],
        ctrlIndex
      );

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
      setup.wpBuffCtrls = Modifier_.createWeaponBuffCtrls(weapon, true);

      calculate(state);
    },
    updateWeapon: (state, action: PayloadAction<Partial<CalcWeapon>>) => {
      const currentSetup = state.setupsById[state.activeId];

      Object.assign(currentSetup.weapon, action.payload);
      calculate(state);
    },
    // ARTIFACTS
    changeArtifact: (state, action: ChangeArtifactAction) => {
      const { pieceIndex, newPiece, shouldKeepStats } = action.payload;
      const setup = state.setupsById[state.activeId];
      const piece = setup.artifacts[pieceIndex];

      if (shouldKeepStats && piece && newPiece) {
        piece.code = newPiece.code;
        piece.rarity = newPiece.rarity;
      } else {
        setup.artifacts[pieceIndex] = newPiece;
      }

      const newArtBuffCtrls = Modifier_.createMainArtifactBuffCtrls(setup.artifacts);

      newArtBuffCtrls.forEach((ctrl) => {
        const oldCtrl = setup.artBuffCtrls.find(
          (oldCtrl) => oldCtrl.code === ctrl.code && oldCtrl.index === ctrl.index
        );
        if (oldCtrl) {
          ctrl.activated = oldCtrl.activated;
          if (ctrl.inputs) ctrl.inputs = oldCtrl.inputs ?? [];
        }
      });

      setup.artBuffCtrls = newArtBuffCtrls;

      const appCharacters = Entity_.getAppCharacters(setup.char.name, setup.party);

      checkToUpdateTeamBuffs(setup, appCharacters);
      calculate(state);
    },
    updateArtifact: (state, action: UpdateArtifactAction) => {
      const { pieceIndex, level, mainStatType, subStat } = action.payload;
      const setup = state.setupsById[state.activeId];
      const piece = setup.artifacts[pieceIndex];

      if (piece) {
        piece.level = level ?? piece.level;
        piece.mainStatType = mainStatType ?? piece.mainStatType;

        if (subStat) {
          Object.assign(piece.subStats[subStat.index], subStat.newInfo);
        }
      }

      const appCharacters = Entity_.getAppCharacters(setup.char.name, setup.party);

      checkToUpdateTeamBuffs(setup, appCharacters);
      calculate(state);
    },
    // MOD CTRLS
    updateTeamBuffs: (
      state,
      action: PayloadAction<PartiallyOptional<TeamBuffCtrl, "activated">>
    ) => {
      const { id, ...newInfo } = action.payload;
      const ctrls = state.setupsById[state.activeId].teamBuffCtrls;
      const ctrl = ctrls.find((ctrl) => ctrl.id === id);

      if (ctrl) {
        Object.assign(ctrl, newInfo);
        calculate(state);
      }
    },
    updateResonance: (state, action: PayloadAction<PartiallyOptional<Resonance, "activated">>) => {
      const { vision, ...newInfo } = action.payload;
      const { resonances } = state.setupsById[state.activeId].elmtModCtrls;
      const resonance = resonances.find((resonance) => resonance.vision === vision);

      if (resonance) {
        Object.assign(resonance, newInfo);
        calculate(state);
      }
    },
    toggleModCtrl: (state, action: ToggleModCtrlAction) => {
      const { modCtrlName, ctrlIndex } = action.payload;
      const ctrls = state.setupsById[state.activeId][modCtrlName];
      const ctrl =
        modCtrlName === "artDebuffCtrls" ? ctrls[ctrlIndex] : Array_.findByIndex(ctrls, ctrlIndex);

      if (ctrl) {
        ctrl.activated = !ctrl.activated;
        calculate(state);
      }
    },
    changeModCtrlInput: (state, action: ChangeModCtrlInputAction) => {
      const { modCtrlName, ctrlIndex, inputIndex, value } = action.payload;
      const ctrls = state.setupsById[state.activeId][modCtrlName];
      const ctrl =
        modCtrlName === "artDebuffCtrls" ? ctrls[ctrlIndex] : Array_.findByIndex(ctrls, ctrlIndex);

      if (ctrl?.inputs) {
        ctrl.inputs[inputIndex] = value;
        calculate(state);
      }
    },
    toggleArtifactBuffCtrl: (state, action: ToggleArtifactBuffCtrlAction) => {
      const { code, ctrlIndex } = action.payload;
      const ctrls = state.setupsById[state.activeId].artBuffCtrls;
      const ctrl = ctrls.find((ctrl) => ctrl.code === code && ctrl.index === ctrlIndex);

      if (ctrl) {
        ctrl.activated = !ctrl.activated;
        calculate(state);
      }
    },
    changeArtifactBuffCtrlInput: (state, action: ChangeArtifactBuffCtrlInputAction) => {
      const { code, ctrlIndex, inputIndex, value } = action.payload;
      const ctrls = state.setupsById[state.activeId].artBuffCtrls;
      const ctrl = ctrls.find((ctrl) => ctrl.code === code && ctrl.index === ctrlIndex);

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
          activeSetup.customBuffCtrls.push(...Array_.toArray(ctrls));
          break;
        case "EDIT":
          for (const { index, ...newInfo } of Array_.toArray(ctrls)) {
            Object.assign(activeSetup.customBuffCtrls[index], newInfo);
          }
          break;
        case "REPLACE":
          activeSetup.customBuffCtrls = Array_.toArray(ctrls);
          break;
      }
      calculate(state);
    },
    updateCustomDebuffCtrls: (state, action: UpdateCustomDebuffCtrlsAction) => {
      const { actionType, ctrls } = action.payload;
      const activeSetup = state.setupsById[state.activeId];

      switch (actionType) {
        case "ADD":
          activeSetup.customDebuffCtrls.unshift(...Array_.toArray(ctrls));
          break;
        case "EDIT":
          for (const { index, ...newInfo } of Array_.toArray(ctrls)) {
            Object.assign(activeSetup.customDebuffCtrls[index], newInfo);
          }
          break;
        case "REPLACE":
          activeSetup.customDebuffCtrls = Array_.toArray(ctrls);
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
      Object.assign(state.target, action.payload);

      const { target } = state;
      const { variantType, inputs = [] } = target;
      const monster = $AppData.getMonster(target);

      // not update target if monster code === 0 (custom target)
      if (monster?.code) {
        const { resistance, variant } = monster;
        const { base, ...otherResistances } = resistance;
        const inputConfigs = monster.inputConfigs ? Array_.toArray(monster.inputConfigs) : [];

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
      const { setupManageInfos, setupsById, activeId } = state;
      const removedIds = [];
      // Reset comparedIds before repopulate with newSetupManageInfos
      state.comparedIds = [];

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
            const oldInfo = Array_.findById(setupManageInfos, ID);
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
              setupsById[ID] = Object_.clone(setupsById[originId]);
            }
            break;
          }
          case "NEW": {
            tempManageInfos.push({
              ID,
              name: newSetupName,
              type: "original",
            });

            setupsById[ID] = Setup_.createCalcSetup({
              char: setupsById[activeId].char,
            });
            break;
          }
        }
      }

      for (const ID of removedIds) {
        delete setupsById[ID];
        delete state.resultById[ID];
      }

      const activeSetup = Array_.findById(tempManageInfos, activeId);
      const newActiveId = activeSetup ? activeSetup.ID : tempManageInfos[0].ID;

      // if (state.configs.separateCharInfo && !newConfigs.separateCharInfo) {
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
      const { mergeCharInfo, travelerChanged = false } = action.payload;
      const activeChar = state.setupsById[state.activeId]?.char;
      const allSetups = Object.values(state.setupsById);
      let shouldRecalculateAll = false;

      if (mergeCharInfo && activeChar) {
        for (const setup of allSetups) {
          setup.char = activeChar;
        }
        shouldRecalculateAll = true;
      }

      shouldRecalculateAll ||=
        travelerChanged && allSetups.some((setup) => $AppCharacter.checkIsTraveler(setup.char));

      if (shouldRecalculateAll) {
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
  updateTeammate,
  removeTeammate,
  updateTeammateWeapon,
  updateTeammateArtifact,
  changeWeapon,
  updateWeapon,
  updateArtifact,
  changeArtifact,
  updateResonance,
  updateTeamBuffs,
  toggleModCtrl,
  changeModCtrlInput,
  toggleArtifactBuffCtrl,
  changeArtifactBuffCtrlInput,
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
