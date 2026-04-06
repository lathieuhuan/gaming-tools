import { Object_ } from "ron-utils";

import type {
  ArtifactStateData,
  ArtifactSubStat,
  ArtifactType,
  ElementalEvent,
  RawCharacter,
  ITarget,
  WeaponStateData,
} from "@/types";

import { createTarget } from "@/logic/entity.logic";
import { createWeaponBuffCtrls } from "@/logic/modifier.logic";
import { Artifact, ArtifactGear, Team, Weapon } from "@/models";
import { useSettingsStore } from "@Store/settings";
import { useCalcStore } from "../calculatorStore";
import { selectSetup } from "../selectors";
import { onActiveSetup } from "../utils";

// ===== CHARACTER =====

export const updateMain = (data: Partial<RawCharacter>, setupIds?: number[]) => {
  const { separateCharInfo } = useSettingsStore.getState();

  const ids =
    setupIds ||
    (separateCharInfo
      ? [useCalcStore.getState().activeId]
      : useCalcStore.getState().setupManagers.map(({ ID }) => ID));

  useCalcStore.setState((state) => {
    const { setupsById } = state;

    for (const setupId of ids) {
      const setup = setupsById[setupId];
      const main = setup.main;
      const prevEnhanced = main.enhanced;

      main.state.update(data);
      setup.main = main.clone();

      if (data.enhanced !== undefined && data.enhanced !== prevEnhanced) {
        setup.team = new Team([setup.main, ...setup.teammates]);
      }

      setupsById[setupId] = setup.calculate();
    }
  });
};

// ===== WEAPON =====

export const switchMainWeapon = (weapon: Weapon) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.main.weapon = weapon.clone();
      setup.wpBuffCtrls = createWeaponBuffCtrls(weapon.data, true);
    })
  );
};

export const updateMainWeapon = (data: Partial<WeaponStateData>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { main } = setup;
      // const oldWeaponCode = main.weapon.code;
      // const newWeaponCode = data.code;

      main.weapon = main.weapon.clone({ state: data });

      // if (newWeaponCode && newWeaponCode !== oldWeaponCode) {
      //   main.weapon.data = $AppWeapon.get(newWeaponCode)!;
      //   setup.wpBuffCtrls = createWeaponBuffCtrls(main.weapon.data, true);
      // }
    })
  );
};

// ===== ARTIFACT =====

export const setArtifactPiece = (artifact: Artifact, shouldKeepStats = false) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const atfPieces = setup.main.atfGear.pieces.clone();
      const oldPiece = atfPieces.get(artifact.type);
      const newState: Partial<ArtifactStateData> =
        shouldKeepStats && oldPiece
          ? {
              ...oldPiece?.state,
              rarity: artifact.rarity,
            }
          : {};

      atfPieces.set(artifact.type, artifact.clone({ state: newState }));

      setup.setArtifactGear(new ArtifactGear(atfPieces));
    })
  );
};

export const removeArtifactPiece = (type: ArtifactType) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const pieces = setup.main.atfGear.pieces.clone();

      pieces.delete(type);
      setup.setArtifactGear(new ArtifactGear(pieces));
    })
  );
};

export const updateArtifactPiece = (type: ArtifactType, newState: Partial<ArtifactStateData>) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const pieces = setup.main.atfGear.pieces.clone();
      const piece = pieces.get(type)?.clone({ state: newState });

      if (!piece) {
        return false;
      }

      setup.main.atfGear = new ArtifactGear(pieces.set(type, piece));
    })
  );
};

export const updateArtifactPieceSubStat = (
  type: ArtifactType,
  index: number,
  data: Partial<ArtifactSubStat>
) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const pieces = setup.main.atfGear.pieces.clone();
      const piece = pieces.get(type)?.clone();

      if (!piece) {
        return false;
      }

      piece.state.updateSubStatByIndex(index, data);
      setup.main.atfGear = new ArtifactGear(pieces.set(type, piece));
    })
  );
};

export const copyArtifacts = (sourceId: number) => {
  const sourceSetup = useCalcStore.getState().setupsById[sourceId];
  const sourcePieces = sourceSetup.main.atfGear.pieces.deepClone();

  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.main.atfGear = new ArtifactGear(sourcePieces);
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
