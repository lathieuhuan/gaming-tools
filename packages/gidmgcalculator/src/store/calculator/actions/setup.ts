import type { WritableDraft } from "immer/src/internal.js";
import type { ISetupManager } from "@/types";

import { CalcSetup } from "@/models/calculator";
import Array_ from "@/utils/Array";
import { useCalcStore } from "../calculator-store";
import { getCopyName, onActiveSetup } from "../utils";

// export function updateSetup(setup: CalcSetup, setupId?: number) {
//   const { activeId, setupsById } = useCalcStore.getState();
//   const id = setupId ?? activeId;

//   useCalcStore.setState({
//     setupsById: {
//       ...setupsById,
//       [id]: setup.calculate(),
//     },
//   });
// }

export const updateActiveSetup = (
  callback: (setup: WritableDraft<CalcSetup>) => boolean | void
) => {
  useCalcStore.setState(onActiveSetup(callback));
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
      setupsById[setupID] = setupsById[sourceId].clone({ ID: setupID }).calculate();

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

export type MultiSetupChange = ISetupManager & {
  status: "REMOVED" | "OLD" | "NEW" | "DUPLICATE";
  originId?: number;
  isCompared: boolean;
};

export const updateMultiSetups = (changes: MultiSetupChange[], newStandardId: number) => {
  useCalcStore.setState((state) => {
    const { setupManagers, setupsById, activeId, target } = state;
    const removedIds: number[] = [];
    const tempManagers: ISetupManager[] = [];

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

          const newSetup = new CalcSetup({
            ID: change.ID,
            main: setupsById[activeId].cloneMain(),
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
