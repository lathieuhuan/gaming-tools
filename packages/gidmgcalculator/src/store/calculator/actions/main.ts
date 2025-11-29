import type { MainArtifactGear, MainCharacterUpdateData, MainWeapon } from "@/models/calculator";
import type { AppMonster, ElementalEvent, ITarget, MonsterInputChanges } from "@/types";
import type { ForwardedAction } from "../types";

import { ATTACK_ELEMENTS } from "@/constants";
import { createWeaponBuffCtrls, MainTarget } from "@/models/calculator";
import { $AppData, $AppSettings } from "@/services";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { useCalcStore } from "../calculator-store";
import { onActiveSetup } from "../utils";

// ===== CHARACTER =====

export const updateCharacter = (data: MainCharacterUpdateData, setupIds?: number[]) => {
  const ids =
    setupIds ||
    ($AppSettings.get("separateCharInfo")
      ? [useCalcStore.getState().activeId]
      : useCalcStore.getState().setupManagers.map(({ ID }) => ID));

  useCalcStore.setState((state) => {
    const { setupsById } = state;

    for (const setupId of ids) {
      setupsById[setupId].char = setupsById[setupId].char.update(data);
      setupsById[setupId] = setupsById[setupId].calculate();
    }
  });

  return;
};

// ===== WEAPON =====

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

// ===== ARTIFACT =====

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

const applyTargetUpdate = (target: ITarget, monster: AppMonster) => {
  useCalcStore.setState((state) => {
    const { setupsById } = state;

    state.target = new MainTarget(target, monster);

    for (const { ID } of state.setupManagers) {
      setupsById[ID].target = state.target;
      // TODO calculate by certain changes only
      setupsById[ID] = setupsById[ID].calculate();
    }
  });
};

export const updateTarget = (data: Partial<ITarget>) => {
  const state = useCalcStore.getState();
  const currentTarget = state.target;
  const newTarget: ITarget = {
    ...currentTarget,
    ...data,
  };

  const monster =
    newTarget.code !== currentTarget.code ? $AppData.getMonster(newTarget) : currentTarget.data;

  if (!monster) {
    return;
  }

  // not update other properties if monster code === 0 (custom target)
  if (monster.code === 0) {
    applyTargetUpdate(newTarget, monster);
    return;
  }

  const { variantType, inputs = [], resistances } = newTarget;
  const { resistance, variant } = monster;
  const { base, ...otherResistances } = resistance;
  const inputConfigs = monster.inputConfigs ? Array_.toArray(monster.inputConfigs) : [];

  for (const atkElmt of ATTACK_ELEMENTS) {
    resistances[atkElmt] = otherResistances[atkElmt] || base;
  }

  if (variantType && variant?.change) {
    resistances[variantType] += variant.change;
  }

  const updateAsChanges = (changes: MonsterInputChanges) => {
    for (const [key, value] of Object_.entries(changes)) {
      if (value === undefined) {
        continue;
      }

      switch (key) {
        case "base":
          for (const attElmt of ATTACK_ELEMENTS) {
            resistances[attElmt] += value;
          }
          break;
        case "variant":
          if (variantType) {
            resistances[variantType] += value;
          }
          break;
        default:
          resistances[key] += value;
      }
    }
  };

  for (let index = 0; index < inputs.length; index++) {
    const config = inputConfigs[index];

    if (!config) {
      continue;
    }

    const input = inputs[index];
    const { type = "CHECK" } = config;

    switch (type) {
      case "CHECK":
        if (input && config.changes) {
          updateAsChanges(config.changes);
        }
        break;
      case "SELECT":
        if (input === -1 || !config.options) {
          continue;
        }

        const option = config.options[input];

        if (typeof option === "string") {
          if (config.optionChange) {
            resistances[option] += config.optionChange;
          }
        } else {
          updateAsChanges(option.changes);
        }
        break;
    }
  }

  applyTargetUpdate(newTarget, monster);
};
