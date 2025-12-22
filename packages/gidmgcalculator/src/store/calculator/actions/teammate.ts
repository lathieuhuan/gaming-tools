import { Team, type Artifact, type Weapon } from "@/models/base";
import type { AppCharacter, ITeammateArtifact, ITeammateWeapon } from "@/types";
import type { ForwardedAction } from "../types";

import {
  type CalcSetup,
  createArtifactBuffCtrls,
  createWeaponBuffCtrls,
} from "@/models/calculator";
import Object_ from "@/utils/Object";
import { useCalcStore } from "../calculator-store";
import { onActiveSetup } from "../utils";
import { $AppSettings } from "@/services";

export const setTeammate = (teammate: AppCharacter, index: number) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const { charEnhanced } = $AppSettings.get();

      setup.setTeammate({ name: teammate.name, enhanced: charEnhanced }, index, teammate);
    })
  );
};

export const updateTeammate: ForwardedAction<CalcSetup["updateTeammate"]> = (...args) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(...args);
    })
  );
};

export const toggleTeammateEnhance = (tmCode: number) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const teammate = setup.teammates.find((teammate) => teammate.data.code === tmCode);

      if (!teammate) {
        return false;
      }

      setup.updateTeammate(tmCode, {
        enhanced: !teammate.enhanced,
      });

      setup.team = new Team([setup.main, ...setup.teammates]);
    })
  );
};

export const removeTeammate: ForwardedAction<CalcSetup["removeTeammate"]> = (teammate) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.removeTeammate(teammate);
    })
  );
};

export const copyTeammates = (sourceId: number) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      const sourceSetup = useCalcStore.getState().setupsById[sourceId];

      setup.teammates = sourceSetup.teammates.map((teammate) => teammate.clone());
      setup.team = new Team([setup.main, ...setup.teammates]);
      setup.rsnBuffCtrls = Object_.clone(sourceSetup.rsnBuffCtrls);
      setup.rsnDebuffCtrls = Object_.clone(sourceSetup.rsnDebuffCtrls);
      setup.updateTeamBuffCtrls();
    })
  );
};

// ===== Weapon =====

export const changeTeammateWeapon = (tmCode: number, weapon: Weapon) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(tmCode, {
        weapon: {
          code: weapon.code,
          type: weapon.type,
          refi: weapon.refi,
          buffCtrls: createWeaponBuffCtrls(weapon.data, false),
          data: weapon.data,
        },
      });
    })
  );
};

export const updateTeammateWeapon = (
  tmCode: number,
  data: Partial<Pick<ITeammateWeapon, "refi" | "buffCtrls">>
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(tmCode, (teammate) => ({
        weapon: {
          ...teammate.weapon,
          ...data,
        },
      }));
    })
  );
};

// ===== Artifact =====

export const changeTeammateArtifact = (tmCode: number, artifact: Artifact | undefined) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(tmCode, {
        artifact: artifact && {
          code: artifact.code,
          buffCtrls: createArtifactBuffCtrls(artifact.data, false),
          data: artifact.data,
        },
      });

      setup.updateTeamBuffCtrls();
    })
  );
};

export const updateTeammateArtifact = (
  tmCode: number,
  data: Partial<Pick<ITeammateArtifact, "buffCtrls">>
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(tmCode, (teammate) => ({
        artifact: teammate.artifact && {
          ...teammate.artifact,
          ...data,
        },
      }));
    })
  );
};
