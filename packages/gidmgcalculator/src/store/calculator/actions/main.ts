import type {
  CalcSetup,
  MainArtifactGear,
  MainCharacterUpdateData,
  MainTarget,
  MainWeapon,
} from "@/models/calculator";
import type { WritableDraft } from "immer/src/internal.js";
import type { ForwardedAction } from "../types";

import { createWeaponBuffCtrls } from "@/models/calculator";
import { $AppSettings } from "@/services";
import Object_ from "@/utils/Object";
import { useCalcStore } from "@Store/calculator";
import { initialState } from "../calculator-store";
import { onActiveSetup } from "../utils";

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

export const updateActiveSetup = (
  callback: (setup: WritableDraft<CalcSetup>) => boolean | void
) => {
  useCalcStore.setState(onActiveSetup(callback));
};

export const updateCharacter = (data: MainCharacterUpdateData, setupIds?: number[]) => {
  if (setupIds) {
    useCalcStore.setState((state) => {
      const { setupsById } = state;

      for (const setupId of setupIds) {
        setupsById[setupId].char = setupsById[setupId].char.update(data);
        setupsById[setupId] = setupsById[setupId].calculate();
      }
    });

    return;
  }

  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.char = setup.char.update(data);
    })
  );
};

export const updateWeapon: ForwardedAction<MainWeapon["update"]> = (data) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { weapon } = setup.char;
      const newWeapon = weapon.update(data);

      if (newWeapon.code !== weapon.code) {
        setup.wpBuffCtrls = createWeaponBuffCtrls(newWeapon.data, true);
      }

      setup.char.weapon = newWeapon;
    })
  );
};

export const setArtifactPiece: ForwardedAction<MainArtifactGear["setPiece"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const newArtifact = setup.char.artifact.setPiece(...args);

      setup.updateMainArtifact(newArtifact);
    })
  );
};

export const removeArtifact: ForwardedAction<MainArtifactGear["remove"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const newArtifact = setup.char.artifact.remove(...args);

      setup.updateMainArtifact(newArtifact);
    })
  );
};

export const updateArtifact: ForwardedAction<MainArtifactGear["update"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.char.artifact = setup.char.artifact.update(...args);
      // setup.updateTeamBuffCtrls();
    })
  );
};

export const copyArtifacts = (sourceId: number) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const sourceSetup = useCalcStore.getState().setupsById[sourceId];

      setup.char.artifact = sourceSetup.char.artifact.clone();
      setup.artBuffCtrls = Object_.clone(sourceSetup.artBuffCtrls);
      // TODO add debuffCtrls
      setup.updateTeamBuffCtrls();
    })
  );
};

export const updateTarget: ForwardedAction<MainTarget["update"]> = (...args) => {
  useCalcStore.setState((state) => {
    const { setupsById } = state;

    state.target = state.target.update(...args);

    for (const { ID } of state.setupManagers) {
      setupsById[ID].target = state.target;
      // TODO calculate by certain changes only
      setupsById[ID] = setupsById[ID].calculate();
    }
  });
};
