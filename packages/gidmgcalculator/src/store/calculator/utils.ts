import type { WritableDraft } from "immer/src/internal.js";

import type { CalcSetup } from "@/models/calculator";
import type { ElementType, IModifierCtrlBasic, ISetupManager, ResonanceModCtrl } from "@/types";
import type { CalculatorState } from "./types";

export function onActiveSetup(callback: (setup: WritableDraft<CalcSetup>) => boolean | void) {
  return (state: WritableDraft<CalculatorState>) => {
    const { activeId, setupsById } = state;
    const setup = setupsById[activeId];

    if (setup) {
      const shouldCalculate = callback(setup) ?? true;

      if (shouldCalculate) {
        state.setupsById[activeId] = setup.calculate();
      }
    }
  };
}

function destructName(name: string) {
  const lastWord = name.match(/\s+\(([1-9]+)\)$/);

  if (lastWord?.index && lastWord[1]) {
    return {
      nameRoot: name.slice(0, lastWord.index),
      copyNo: lastWord[1],
    };
  }
  return {
    nameRoot: name,
    copyNo: null,
  };
}

export function getCopyName(originalName: string, setupManagers: ISetupManager[]) {
  const { nameRoot } = destructName(originalName);
  const versions = [];

  for (const setupManager of setupManagers) {
    const destructed = destructName(setupManager.name);

    if (destructed.nameRoot === nameRoot && destructed.copyNo) {
      versions[+destructed.copyNo] = true;
    }
  }
  for (let i = 1; i <= 100; i++) {
    if (!versions[i]) {
      return nameRoot + ` (${i})`;
    }
  }

  return undefined;
}

export function toggleModCtrl<T extends IModifierCtrlBasic>(
  ctrls: T[],
  ctrlId: number,
  extraCheck?: (ctrl: T) => boolean
): T[] {
  return ctrls.map((ctrl) => {
    if (ctrl.id === ctrlId && (!extraCheck || extraCheck(ctrl))) {
      return {
        ...ctrl,
        activated: !ctrl.activated,
      };
    }

    return ctrl;
  });
}

export function updateModCtrlInputs<T extends IModifierCtrlBasic>(
  ctrls: T[],
  ctrlId: number,
  inputIndex: number,
  value: number,
  extraCheck?: (ctrl: T) => boolean
) {
  return ctrls.map((ctrl) => {
    if (ctrl.id === ctrlId && (!extraCheck || extraCheck(ctrl))) {
      return {
        ...ctrl,
        inputs: ctrl.inputs?.map((input, index) => (index === inputIndex ? value : input)),
      };
    }

    return ctrl;
  });
}

export function toggleRsnModCtrl(ctrls: ResonanceModCtrl[], type: ElementType) {
  return ctrls.map((ctrl) =>
    ctrl.element === type ? { ...ctrl, activated: !ctrl.activated } : ctrl
  );
}

export function updateRsnModCtrlInputs(
  ctrls: ResonanceModCtrl[],
  type: ElementType,
  inputIndex: number,
  value: number
) {
  return ctrls.map((ctrl) => {
    if (ctrl.element === type) {
      return {
        ...ctrl,
        inputs: ctrl.inputs?.map((input, index) => (index === inputIndex ? value : input)),
      };
    }

    return ctrl;
  });
}
