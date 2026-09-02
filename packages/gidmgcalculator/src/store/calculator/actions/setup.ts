import { Array_, Object_ } from "ron-utils";

import type { ArtifactType, SetupManager } from "@/types";
import type { WritableDraft } from "immer/src/internal.js";
import type { CalculatorState } from "../types";

import { CalcSetup } from "@/logic/calculator";
import { useCalcStore } from "../calculatorStore";
import { getCopyName } from "../utils";

/**
 * @param id Default activeId
 */
export const updateSetup = (
  callback: (
    setup: WritableDraft<CalcSetup>,
    state: WritableDraft<CalculatorState>,
  ) => boolean | void,
  id?: number,
) => {
  useCalcStore.setState((state) => {
    const setupId = id ?? state.activeId;
    const setup = state.setupsById[setupId];

    if (setup) {
      const shouldCalculate = callback(setup, state) ?? true;

      if (shouldCalculate) {
        state.setupsById[setupId] = setup.calculate();
      }
    } else {
      console.error(`Setup with id ${setupId} not found`);
    }
  });
};

export const updateSetupModCtrls = updateSetup;

export const updateSetupAfterSave = (
  setupId: number,
  weaponId: number,
  newPieceIds: Partial<Record<ArtifactType, number>>,
) => {
  useCalcStore.setState((state) => {
    const setup = state.setupsById[setupId];

    if (!setup) {
      return;
    }

    const { main } = setup;
    const { pieces } = setup.main.atfGear;

    main.weapon = main.weapon.clone({ ID: weaponId });

    for (const [type, id] of Object_.entries(newPieceIds)) {
      const piece = pieces[type];

      if (piece === undefined || id === undefined) {
        continue;
      }

      pieces[type] = piece.clone({ ID: id });
    }
  });
};

export const duplicateSetup = (sourceId: number) => {
  useCalcStore.setState((state) => {
    const { comparedIds, setupManagers, setupsById } = state;

    if (setupsById[sourceId]) {
      const setupID = Date.now();
      let setupName = Array_.findById(setupManagers, sourceId)?.name;

      if (setupName) {
        setupName = getCopyName(setupName, setupManagers);
      }

      setupManagers.push({
        ID: setupID,
        name: setupName || "New Setup",
        type: "original",
      });
      // TODO check
      setupsById[setupID] = setupsById[sourceId].clone({ ID: setupID });

      if (comparedIds.includes(sourceId)) {
        state.comparedIds.push(setupID);
      }
    }
  });
};

export const removeSetup = (removeId: number) => {
  useCalcStore.setState((state) => {
    if (state.setupManagers.length > 1) {
      //
      state.setupManagers = state.setupManagers.filter((manager) => manager.ID !== removeId);
      delete state.setupsById[removeId];

      if (removeId === state.activeId) {
        state.activeId = state.setupManagers[0].ID;
      }

      state.comparedIds = state.comparedIds.filter((ID) => ID !== removeId);

      if (state.comparedIds.length === 1) {
        state.comparedIds = [];
      }
      if (removeId === state.standardId && state.comparedIds.length) {
        state.standardId = state.comparedIds[0];
      }
    }
  });
};

export type MultiSetupChange = SetupManager & {
  status: "REMOVED" | "OLD" | "NEW" | "DUPLICATE";
  originId?: number;
  isCompared: boolean;
};

export const updateMultiSetups = (changes: MultiSetupChange[], newStandardId: number) => {
  useCalcStore.setState((state) => {
    const { setupManagers, setupsById, activeId } = state;
    const removedIds: number[] = [];
    const tempManagers: SetupManager[] = [];

    const target = state.target.clone();

    // Reset comparedIds before repopulate with changes
    state.comparedIds = [];

    for (const change of changes) {
      if (change.isCompared) {
        state.comparedIds.push(change.ID);
      }

      const newSetupName = change.name.trim();

      switch (change.status) {
        case "REMOVED": {
          // Store to delete later coz they can be used for ref of DUPLICATE case
          removedIds.push(change.ID);
          break;
        }
        case "OLD": {
          const oldManager = Array_.findById(setupManagers, change.ID);

          if (oldManager) {
            tempManagers.push({
              ...oldManager,
              name: newSetupName,
            });
          }
          break;
        }
        case "DUPLICATE": {
          const { originId } = change;

          if (originId && setupsById[originId]) {
            tempManagers.push({
              ID: change.ID,
              name: newSetupName,
              type: "original",
            });
            setupsById[change.ID] = setupsById[originId].clone({ ID: change.ID });
          }
          break;
        }
        case "NEW": {
          tempManagers.push({
            ID: change.ID,
            name: newSetupName,
            type: "original",
          });

          // TODO check logic
          const newSetup = CalcSetup.create(change.ID, setupsById[activeId].main.deepClone(), {
            target,
          });

          setupsById[change.ID] = newSetup.calculate();
          break;
        }
      }
    }

    for (const ID of removedIds) {
      delete setupsById[ID];
    }

    const newActive = Array_.findById(tempManagers, activeId) || tempManagers[0];

    state.activeId = newActive.ID;
    state.comparedIds = state.comparedIds.length === 1 ? [] : state.comparedIds;
    state.standardId = state.comparedIds.length ? newStandardId : 0;
    state.setupManagers = tempManagers;
  });
};
