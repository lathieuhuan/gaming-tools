import { Object_ } from "ron-utils";

import type {
  AppArtifact,
  ArtifactSubStat,
  ArtifactType,
  ElementalEvent,
  IArtifactBasic,
  ICharacterBasic,
  ITarget,
  IWeaponBasic,
} from "@/types";

import { createArtifact, CreateArtifactParams, createTarget } from "@/logic/entity.logic";
import { createWeaponBuffCtrls } from "@/logic/modifier.logic";
import { ArtifactGear, Team } from "@/models";
import { useSettingsStore } from "@Store/settings";
import { useCalcStore } from "../calculatorStore";
import { onActiveSetup } from "../utils";
import { selectSetup } from "../selectors";

// ===== CHARACTER =====

export const updateMain = (data: Partial<ICharacterBasic>, setupIds?: number[]) => {
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
      const prevEnhanced = setup.main.enhanced;

      setup.main = setup.main.update(data).clone();

      if (data.enhanced !== undefined && data.enhanced !== prevEnhanced) {
        setup.team = new Team([setup.main, ...setup.teammates]);
      }

      setupsById[setupId] = setup.calculate();
    }
  });
};

// ===== WEAPON =====

export const updateMainWeapon = (data: Partial<IWeaponBasic>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { main } = setup;
      const oldWeaponCode = main.weapon.code;

      main.weapon = main.weapon.update(data).clone();

      if (main.weapon.code !== oldWeaponCode) {
        setup.wpBuffCtrls = createWeaponBuffCtrls(main.weapon.data, true);
      }
    })
  );
};

// ===== ARTIFACT =====

export const setArtifactPiece = (
  params: CreateArtifactParams,
  data?: AppArtifact,
  shouldKeepStats = false
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { atfGear } = setup.main;
      const oldPiece = atfGear.pieces.get(params.type);

      if (shouldKeepStats && oldPiece) {
        params = {
          ...oldPiece,
          code: params.code,
          rarity: params.rarity,
          ID: params.ID,
        };
      }

      atfGear.pieces.set(params.type, createArtifact(params, data));

      setup.setArtifactGear(new ArtifactGear(atfGear.pieces));
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

export const updateArtifactPiece = <T extends keyof IArtifactBasic>(
  type: ArtifactType,
  key: T,
  value: IArtifactBasic[T]
) => {
  const setup = selectSetup(useCalcStore.getState());

  useCalcStore.setState(
    onActiveSetup(() => {
      const pieces = setup.main.atfGear.pieces.clone();
      const piece = pieces.get(type)?.update(key, value);

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
      const piece = pieces.get(type)?.updateSubStatByIndex(index, data);

      if (!piece) {
        return false;
      }

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
