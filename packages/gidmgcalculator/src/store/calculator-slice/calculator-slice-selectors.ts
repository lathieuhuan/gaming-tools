import type { RootState } from "../index";

export const selectCalcSetupsById = (state: RootState) => state.calculator.setupsById;

export const selectActiveId = (state: RootState) => state.calculator.activeId;

export const selectStandardId = (state: RootState) => state.calculator.standardId;

export const selectComparedIds = (state: RootState) => state.calculator.comparedIds;

export const selectSetupManageInfos = (state: RootState) => state.calculator.setupManageInfos;

export const selectCharacter = (state: RootState) => state.calculator.setupsById[state.calculator.activeId]?.char;

export const selectArtifacts = (state: RootState) => state.calculator.setupsById[state.calculator.activeId]?.artifacts;

export const selectWeapon = (state: RootState) => state.calculator.setupsById[state.calculator.activeId]?.weapon;

export const selectTeammates = (state: RootState) => state.calculator.setupsById[state.calculator.activeId]?.party;

export const selectMoonsignCtrl = (state: RootState) =>
  state.calculator.setupsById[state.calculator.activeId]?.moonsignCtrl;

export const selectElmtModCtrls = (state: RootState) =>
  state.calculator.setupsById[state.calculator.activeId]?.elmtModCtrls;

export const selectCustomInfusion = (state: RootState) =>
  state.calculator.setupsById[state.calculator.activeId].customInfusion;

export const selectTarget = (state: RootState) => state.calculator.target;

export const selectTotalAttr = (state: RootState) => state.calculator.resultById[state.calculator.activeId].totalAttr;

export const selectAttkBonuses = (state: RootState) =>
  state.calculator.resultById[state.calculator.activeId].attkBonuses;

export const selectCalcFinalResult = (state: RootState) =>
  state.calculator.resultById[state.calculator.activeId].finalResult;
