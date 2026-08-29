import { Object_ } from "ron-utils";

import type {
  ArtifactStateData,
  ArtifactSubStat,
  ArtifactType,
  ElementalEvent,
  RawCharacter,
  TargetData,
  WeaponStateData,
} from "@/types";

import { createTarget } from "@/logic/entity.logic";
import { createWeaponBuffCtrls } from "@/logic/modifier.logic";
import { Artifact, ArtifactCloneOptions, ArtifactGear, Team, Weapon } from "@/models";
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

      setup.main = main.clone(data);

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
    }),
  );
};

export const updateMainWeapon = (data: Partial<WeaponStateData>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { main } = setup;

      main.weapon = main.weapon.clone(data);
    }),
  );
};

// ===== ARTIFACT =====

export const setArtifactPiece = (artifact: Artifact, shouldKeepStats = false) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const pieces = { ...setup.main.atfGear.pieces };
      const oldPiece = pieces[artifact.type];
      const cloneOptions: ArtifactCloneOptions =
        shouldKeepStats && oldPiece
          ? {
              type: oldPiece.type,
              rarity: artifact.rarity,
              level: oldPiece.level,
              mainStatType: oldPiece.mainStatType,
              subStats: oldPiece.subStats,
            }
          : {};

      pieces[artifact.type] = artifact.clone(cloneOptions);

      setup.setArtifactGear(ArtifactGear.create(pieces));
    }),
  );
};

export const removeArtifactPiece = (type: ArtifactType) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const pieces = {
        ...setup.main.atfGear.pieces,
        [type]: undefined,
      };

      setup.setArtifactGear(ArtifactGear.create(pieces));
    }),
  );
};

export const updateArtifactPiece = (type: ArtifactType, newState: Partial<ArtifactStateData>) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const { pieces } = setup.main.atfGear;
      const piece = pieces[type];

      if (piece === undefined) {
        return false;
      }

      setup.main.atfGear = ArtifactGear.create({
        ...pieces,
        [type]: piece.clone(newState),
      });
    }),
  );
};

export const updateArtifactPieceSubStat = (
  type: ArtifactType,
  index: number,
  data: Partial<ArtifactSubStat>,
) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const { pieces } = setup.main.atfGear;
      const piece = pieces[type];

      if (piece === undefined) {
        return false;
      }

      piece.updateSubStat(index, data);

      setup.main.atfGear = ArtifactGear.create({
        ...pieces,
        [type]: piece.clone(),
      });
    }),
  );
};

export const copyArtifacts = (sourceId: number) => {
  const sourceSetup = useCalcStore.getState().setupsById[sourceId];

  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.main.atfGear = sourceSetup.main.atfGear.deepClone();
      setup.artBuffCtrls = Object_.clone(sourceSetup.artBuffCtrls);
      setup.artDebuffCtrls = Object_.clone(sourceSetup.artDebuffCtrls);
      setup.updateTeamBuffCtrls();
    }),
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
    }),
  );
};

// ===== TARGET =====

export const updateTarget = (data: Partial<TargetData>) => {
  useCalcStore.setState((state) => {
    const { setupsById, target: currentTarget } = state;
    const newInfo: TargetData = {
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
