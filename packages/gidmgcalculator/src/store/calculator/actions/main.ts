import type { Artifact, Target, Weapon } from "@/models";
import type {
  ArtifactSubStat,
  ArtifactType,
  ElementalEvent,
  RawArtifactState,
  RawCharacterState,
  RawWeaponState,
} from "@/types";

import { useSettingsStore } from "@Store/settings";
import { useCalcStore } from "../calculatorStore";
import { onActiveSetup } from "../utils";

// ===== CHARACTER =====

export const updateMain = (data: Partial<RawCharacterState>, setupIds?: number[]) => {
  const { separateCharInfo } = useSettingsStore.getState();

  useCalcStore.setState((state) => {
    const { setupsById } = state;

    setupIds ||= separateCharInfo ? [state.activeId] : state.setupManagers.map(({ ID }) => ID);

    for (const setupId of setupIds) {
      const setup = setupsById[setupId];

      setup.updateMainState(data);
      setupsById[setupId] = setup.calculate();
    }
  });
};

// ===== WEAPON =====

export const switchMainWeapon = (weapon: Weapon) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.switchMainWeapon(weapon);
    }),
  );
};

export const updateMainWeapon = (data: Partial<RawWeaponState>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateMainWeapon(data);
    }),
  );
};

// ===== ARTIFACT =====

export const setArtifactPiece = (artifact: Artifact, shouldKeepStats = false) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.setArtifactPiece(artifact, shouldKeepStats);
    }),
  );
};

export const removeArtifactPiece = (type: ArtifactType) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.removeArtifactPiece(type);
    }),
  );
};

export const updateArtifactPiece = (type: ArtifactType, newState: Partial<RawArtifactState>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateArtifactPiece(type, newState);
    }),
  );
};

export const updateArtifactPieceSubStat = (
  type: ArtifactType,
  index: number,
  data: Partial<ArtifactSubStat>,
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateArtifactPieceSubStat(type, index, data);
    }),
  );
};

export const copyArtifacts = (sourceId: number) => {
  const sourceSetup = useCalcStore.getState().setupsById[sourceId];

  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.copyArtifacts(sourceSetup);
    }),
  );
};

// ===== ELEMENTAL EVENT =====

export const updateElementalEvent = (data: Partial<ElementalEvent>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateElementalEvent(data);
    }),
  );
};

// ===== TARGET =====

export const setTarget = (target: Target) => {
  useCalcStore.setState((state) => {
    const { setupsById } = state;

    state.target = target;

    for (const { ID } of state.setupManagers) {
      setupsById[ID].target = target.clone();
      setupsById[ID] = setupsById[ID].calculate();
    }
  });
};
