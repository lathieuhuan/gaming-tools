import { Array_ } from "ron-utils";

import type { TavernSelectedCharacter } from "@/components";
import type { BasicSetupType, ISetupManager } from "@/types";
import type { UserdbState } from "@Store/userdbSlice";
import type { CalculatorState } from "../types";

import { createCharacter, createWeapon } from "@/logic/entity.logic";
import { parseDbArtifacts } from "@/logic/userdb.logic";
import { CalcSetup, CalcSetupConstructInfo } from "@/models";
import { $AppCharacter } from "@/services";
import IdStore from "@/utils/IdStore";
import { updateSettings } from "@Store/settings";
import { isTourFinished } from "@Store/tours";
import { updateUI } from "@Store/ui";
import { initialState, useCalcStore } from "../calculatorStore";

type InitSessionPayload = {
  name?: string;
  type?: BasicSetupType;
  calcSetup: CalcSetup;
};

export const initSession = (payload: InitSessionPayload) => {
  const { name = "Setup 1", type = "original", calcSetup } = payload;
  const { ID, main, teammates } = calcSetup;

  useCalcStore.setState({
    ...initialState,
    setupManagers: [{ ID, name, type }],
    setupsById: {
      [ID]: calcSetup.calculate(),
    },
    activeId: ID,
    target: calcSetup.target,
  });

  updateSettings({ separateCharInfo: false });
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

export const applySettingsToCalculator = (unifyCharacters: boolean, travelerChanged: boolean) => {
  useCalcStore.setState((state) => {
    const { setupsById } = state;
    const activeMain = setupsById[state.activeId]?.main;

    if (!activeMain) {
      return;
    }

    const shouldRecalculateAll = travelerChanged && $AppCharacter.checkIsTraveler(activeMain);

    for (const [id, setup] of Object.entries(setupsById)) {
      if (unifyCharacters) {
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

    const { target } = params;

    if (overwriteTarget && target) {
      state.target = target;

      for (const setup of Object.values(setupsById)) {
        setup.target = target;
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

export function initSessionWithCharacter(
  selectedCharacter: TavernSelectedCharacter,
  userDb: UserdbState
) {
  const { userData, data } = selectedCharacter;
  const { weaponID, artifactIDs } = userData ?? {};
  const { userWps, userArts } = userDb;

  const idStore = new IdStore();

  const dbWeapon = weaponID ? Array_.findById(userWps, weaponID) : undefined;
  const weapon = dbWeapon
    ? createWeapon(dbWeapon)
    : createWeapon({ ID: idStore.gen(), type: data.weaponType });

  const atfGear = parseDbArtifacts(artifactIDs, userArts);

  const main = createCharacter({ code: data.code }, data, {
    state: userData,
    weapon,
    atfGear,
  });

  const calcSetup = new CalcSetup({
    ID: idStore.gen(),
    main,
  });

  initSession({
    calcSetup,
  });

  if (!isTourFinished("CHAR_ENHANCE") && main.data.enhanceType) {
    updateUI({ appModalType: "CHAR_ENHANCE_NOTICE" });
  }
}
