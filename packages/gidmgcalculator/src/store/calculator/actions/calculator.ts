import type { CalculatorState } from "../types";

import { CalcSetup } from "@/models/calculator";
import { $AppCharacter, $AppSettings } from "@/services";
import { initialState, useCalcStore } from "../calculator-store";

type InitSessionPayload = {
  name?: string;
  type?: "original" | "combined";
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
    const activeChar = setupsById[state.activeId]?.char;
    const shouldRecalculateAll = travelerChanged && $AppCharacter.checkIsTraveler(activeChar);

    for (const [id, setup] of Object.entries(setupsById)) {
      if (unifyCharacters && activeChar) {
        setup.char = activeChar;
      }
      if (unifyCharacters || shouldRecalculateAll) {
        setupsById[id] = setup.calculate();
      }
    }
  });
};
