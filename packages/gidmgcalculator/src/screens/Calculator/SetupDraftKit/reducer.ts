import { MAX_CALC_SETUPS } from "@/constants/config";
import { MultiSetupChange } from "@Store/calculator/actions";
import { getCopyName } from "@Store/calculator/utils";

export type SetupDraftKitState = {
  setups: MultiSetupChange[];
  standardId: number;
};

export type SetupDraftKitAction =
  | { type: "ADD" }
  | { type: "DUPLICATE"; setupId: number }
  | { type: "REMOVE"; setupId: number }
  | { type: "RENAME"; setupId: number; name: string }
  | { type: "TOGGLE_COMPARE"; setupId: number }
  | { type: "SELECT_STANDARD"; setupId: number };

export function setupDraftKitReducer(
  state: SetupDraftKitState,
  action: SetupDraftKitAction,
): SetupDraftKitState {
  const visibleSetups = getVisibleSetups(state.setups);
  let setups = state.setups;
  let standardId = state.standardId;

  switch (action.type) {
    case "ADD": {
      setups = [
        ...setups,
        {
          ID: Date.now(),
          name: getNewSetupName(visibleSetups),
          type: "original",
          status: "NEW",
          isCompared: false,
        },
      ];
      break;
    }
    case "DUPLICATE": {
      const rootSetup = visibleSetups.find((setup) => setup.ID === action.setupId);

      if (!rootSetup) {
        return state;
      }

      setups = [
        ...setups,
        {
          ...rootSetup,
          ID: Date.now(),
          name: getCopyName(rootSetup.name, visibleSetups) || "New setup",
          type: "original",
          originId: rootSetup.ID,
          status: "DUPLICATE",
        },
      ];
      break;
    }
    case "REMOVE": {
      const index = setups.findIndex((setup) => setup.ID === action.setupId);

      if (index === -1 || visibleSetups.length <= 1) {
        return state;
      }

      if (setups[index].status === "OLD") {
        setups = setups.map((setup, setupIndex) =>
          setupIndex === index
            ? {
                ...setup,
                status: "REMOVED",
                isCompared: false,
              }
            : setup,
        );
      } else {
        setups = setups.filter((_, setupIndex) => setupIndex !== index);
      }
      break;
    }
    case "RENAME": {
      setups = setups.map((setup) =>
        setup.ID === action.setupId ? { ...setup, name: action.name } : setup,
      );
      break;
    }
    case "TOGGLE_COMPARE": {
      setups = setups.map((setup) =>
        setup.ID === action.setupId ? { ...setup, isCompared: !setup.isCompared } : setup,
      );
      break;
    }
    case "SELECT_STANDARD": {
      const setup = visibleSetups.find((item) => item.ID === action.setupId);

      if (!setup?.isCompared) {
        return state;
      }

      standardId = action.setupId;
      break;
    }
  }

  const comparedSetups = setups.filter((setup) => setup.status !== "REMOVED" && setup.isCompared);
  const standardIsCompared = comparedSetups.some((setup) => setup.ID === standardId);

  return {
    setups,
    standardId: standardIsCompared ? standardId : comparedSetups[0]?.ID || 0,
  };
}

export function getVisibleSetups(setups: MultiSetupChange[]) {
  return setups.filter((setup) => setup.status !== "REMOVED");
}

function getNewSetupName(setups: Array<{ name: string }>) {
  const regex = /^Setup (\d+)$/;

  const usedIndexes = new Set(
    setups
      .map(({ name }) => regex.exec(name)?.[1])
      .filter((index): index is string => index !== undefined)
      .map(Number),
  );

  for (let index = 1; index <= MAX_CALC_SETUPS; index++) {
    if (!usedIndexes.has(index)) {
      return `Setup ${index}`;
    }
  }

  return "New setup";
}
