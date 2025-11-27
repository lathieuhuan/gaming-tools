import type { Artifact, Weapon } from "@/models/base";
import type { AppCharacter, ITeammateArtifact, ITeammateWeapon } from "@/types";
import type { ForwardedAction } from "../types";

import {
  type CalcSetup,
  createArtifactBuffCtrls,
  createWeaponBuffCtrls,
} from "@/models/calculator";
import Object_ from "@/utils/Object";
import { useCalcStore } from "../calculator-store";
import { onActiveSetup, toggleModCtrl, updateModCtrlInputs } from "../utils";

export const setTeammate = (teammate: AppCharacter, index: number) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.setTeammate({ name: teammate.name }, index, teammate);
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
      setup.team = setup.team.update({ teammates: setup.teammates });
      setup.rsnBuffCtrls = Object_.clone(sourceSetup.rsnBuffCtrls);
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

// ===== Modifier =====

export type ToggleTeammateModCtrlPath = {
  teammateCode: number;
  modCtrlName: "buffCtrls" | "debuffCtrls";
  ctrlId: number;
};

export const toggleTeammateModCtrl = (path: ToggleTeammateModCtrlPath) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(path.teammateCode, (teammate) => {
        switch (path.modCtrlName) {
          case "buffCtrls":
            return {
              buffCtrls: toggleModCtrl(teammate.buffCtrls, path.ctrlId),
            };
          case "debuffCtrls":
            return {
              debuffCtrls: toggleModCtrl(teammate.debuffCtrls, path.ctrlId),
            };
        }
      });
    })
  );
};

export const updateTeammateModCtrlInput = (
  path: ToggleTeammateModCtrlPath,
  inputIndex: number,
  value: number
) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.updateTeammate(path.teammateCode, ({ buffCtrls, debuffCtrls }) => {
        switch (path.modCtrlName) {
          case "buffCtrls":
            return {
              buffCtrls: updateModCtrlInputs(buffCtrls, path.ctrlId, inputIndex, value),
            };
          case "debuffCtrls":
            return {
              debuffCtrls: updateModCtrlInputs(debuffCtrls, path.ctrlId, inputIndex, value),
            };
        }
      });
    })
  );
};
