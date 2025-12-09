import type { CalcSetup, MainUpdateData } from "@/models/calculator";
import type { ElementalEvent, ITarget } from "@/types";
import type { ForwardedAction } from "../types";

import { createWeaponBuffCtrls } from "@/models/calculator";
import { $AppSettings } from "@/services";
import { createTarget } from "@/utils/Entity";
import Object_ from "@/utils/Object";
import { useCalcStore } from "../calculator-store";
import { onActiveSetup } from "../utils";

// ===== CHARACTER =====

export const updateMain = (data: MainUpdateData, setupIds?: number[]) => {
  const ids =
    setupIds ||
    ($AppSettings.get("separateCharInfo")
      ? [useCalcStore.getState().activeId]
      : useCalcStore.getState().setupManagers.map(({ ID }) => ID));

  useCalcStore.setState((state) => {
    const { setupsById } = state;

    for (const setupId of ids) {
      setupsById[setupId].main = setupsById[setupId].updateMain(data);
      setupsById[setupId] = setupsById[setupId].calculate();
    }
  });

  return;
};

// ===== WEAPON =====

export const updateMainWeapon: ForwardedAction<CalcSetup["updateMainWeapon"]> = (data) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { weapon } = setup.main;
      const newWeapon = setup.updateMainWeapon(data);

      if (newWeapon.code !== weapon.code) {
        setup.wpBuffCtrls = createWeaponBuffCtrls(newWeapon.data, true);
      }

      setup.main.weapon = newWeapon;
    })
  );
};

// ===== ARTIFACT =====

export const setArtifactPiece: ForwardedAction<CalcSetup["setArtifactPiece"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const newAtfGear = setup.setArtifactPiece(...args);

      setup.setArtifactGear(newAtfGear);
    })
  );
};

export const removeArtifactPiece: ForwardedAction<CalcSetup["removeArtifactPiece"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const newAtfGear = setup.removeArtifactPiece(...args);

      setup.setArtifactGear(newAtfGear);
    })
  );
};

export const updateArtifactPiece: ForwardedAction<CalcSetup["updateArtifactPiece"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.main.atfGear = setup.updateArtifactPiece(...args);
    })
  );
};

export const copyArtifacts = (sourceId: number) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const sourceSetup = useCalcStore.getState().setupsById[sourceId];

      setup.main.atfGear = sourceSetup.cloneArtifactGear();
      setup.artBuffCtrls = Object_.clone(sourceSetup.artBuffCtrls);
      setup.artDebuffCtrls = Object_.clone(sourceSetup.artDebuffCtrls);
      setup.updateTeamBuffCtrls();
    })
  );
};

// ===== ELEMENTAL EVENT =====

export const updateElementalEvent = (data: Partial<ElementalEvent>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.elmtEvent = {
        ...setup.elmtEvent,
        ...data,
      };
    })
  );
};

// ===== TARGET =====

export const updateTarget = (data: Partial<ITarget>) => {
  useCalcStore.setState((state) => {
    const { setupsById, target: currentTarget } = state;
    const newInfo: ITarget = {
      ...currentTarget,
      ...data,
    };

    const target =
      newInfo.code !== currentTarget.code
        ? createTarget(newInfo)
        : createTarget(newInfo, currentTarget.data);

    state.target = target;

    for (const { ID } of state.setupManagers) {
      setupsById[ID].target = state.target;
      setupsById[ID] = setupsById[ID].calculate();
    }
  });
};
