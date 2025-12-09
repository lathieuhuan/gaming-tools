import type { BasicSetupType, ISetupManager } from "@/types";
import type { CalculatorState } from "../types";

import { CalcSetup, CalcSetupConstructInfo } from "@/models/calculator";
import { $AppCharacter, $AppSettings } from "@/services";
import { initialState, useCalcStore } from "../calculator-store";

type InitSessionPayload = {
  name?: string;
  type?: BasicSetupType;
  calcSetup: CalcSetup;
};

export const initSession = (payload: InitSessionPayload) => {
  const { name = "Setup 1", type = "original", calcSetup } = payload;
  const { ID } = calcSetup;

  $AppSettings.patch({ separateCharInfo: false });

  useCalcStore.setState({
    ...initialState,
    setupManagers: [{ ID, name, type }],
    setupsById: {
      [ID]: calcSetup.calculate(),
    },
    activeId: ID,
    target: calcSetup.target,
  });
};

export const updateCalculator = (
  data: Partial<Pick<CalculatorState, "activeId" | "standardId" | "comparedIds">>
) => {
  useCalcStore.setState((state) => {
    state.activeId = data.activeId ?? state.activeId;
    state.standardId = data.standardId ?? state.standardId;
    state.comparedIds = data.comparedIds ?? state.comparedIds;
  });
};

export const applySettings = (unifyCharacters: boolean, travelerChanged: boolean) => {
  useCalcStore.setState((state) => {
    const { setupsById } = state;
    const activeMain = setupsById[state.activeId]?.main;
    const shouldRecalculateAll = travelerChanged && $AppCharacter.checkIsTraveler(activeMain);

    for (const [id, setup] of Object.entries(setupsById)) {
      if (unifyCharacters && activeMain) {
        setup.main = activeMain;
      }
      if (unifyCharacters || shouldRecalculateAll) {
        setupsById[id] = setup.calculate();
      }
    }
  });
};

type ImportSetupOptions = {
  overwriteChar?: boolean;
  overwriteTarget?: boolean;
};

export const importSetup = (
  params: CalcSetupConstructInfo,
  /** ID in manageInfo is prioritized over params.ID */
  manageInfo: Partial<ISetupManager> = {},
  options: ImportSetupOptions = {}
) => {
  const { overwriteChar = false, overwriteTarget = false } = options;
  const { type = "original", name = "New setup" } = manageInfo;

  useCalcStore.setState((state) => {
    const { setupsById } = state;

    if (overwriteChar) {
      for (const setup of Object.values(setupsById)) {
        setup.main = params.main;
      }
    }

    if (overwriteTarget) {
      state.target = params.target;

      for (const setup of Object.values(setupsById)) {
        setup.target = params.target;
      }
    }

    if (overwriteChar || overwriteTarget) {
      for (const { ID } of state.setupManagers) {
        setupsById[ID] = setupsById[ID].calculate();
      }
    }

    const setupId = manageInfo.ID ?? params.ID ?? Date.now();
    const newSetup = new CalcSetup({
      ...params,
      ID: setupId,
    });

    state.setupManagers.push({ ID: setupId, name, type });
    state.setupsById[setupId] = newSetup.calculate();
    state.activeId = setupId;
  });
};
