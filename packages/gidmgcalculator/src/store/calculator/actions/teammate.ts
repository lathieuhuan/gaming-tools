import type { ForwardedAction } from "../types";

import { CalcSetup } from "@/logic/calculator";
import { useCalcStore } from "../calculatorStore";
import { onActiveSetup } from "../utils";

export const setTeammate: ForwardedAction<CalcSetup["setTeammate"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.setTeammate(...args);
    }),
  );
};

export const updateTeammateModCtrls: ForwardedAction<CalcSetup["updateTeammateModCtrls"]> = (
  ...args
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammateModCtrls(...args);
    }),
  );
};

export const toggleTeammateEnhance: ForwardedAction<CalcSetup["toggleTeammateEnhance"]> = (
  ...args
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.toggleTeammateEnhance(...args);
    }),
  );
};

export const removeTeammate: ForwardedAction<CalcSetup["removeTeammate"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.removeTeammate(...args);
    }),
  );
};

export const copyTeammates = (sourceId: number) => {
  const sourceSetup = useCalcStore.getState().setupsById[sourceId];

  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.copyTeammates(sourceSetup);
    }),
  );
};

// ===== Weapon =====

export const changeTeammateWeapon: ForwardedAction<CalcSetup["changeTeammateWeapon"]> = (
  ...args
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.changeTeammateWeapon(...args);
    }),
  );
};

export const updateTeammateWeapon: ForwardedAction<CalcSetup["updateTeammateWeapon"]> = (
  ...args
) => {
  useCalcStore.setState(onActiveSetup((setup) => setup.updateTeammateWeapon(...args)));
};

// ===== Artifact =====

export const changeTeammateArtifact: ForwardedAction<CalcSetup["changeTeammateArtifact"]> = (
  ...args
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.changeTeammateArtifact(...args);
    }),
  );
};

export const updateTeammateArtifact: ForwardedAction<CalcSetup["updateTeammateArtifact"]> = (
  ...args
) => {
  useCalcStore.setState(onActiveSetup((setup) => setup.updateTeammateArtifact(...args)));
};
