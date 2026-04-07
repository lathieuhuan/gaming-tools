import type { IDbComplexSetup, IDbSetup, TeammateArtifact } from "@/types";
import type { UserdbState } from "@Store/userdbSlice";
import type { SetupOverviewInfo } from "../types";

import { enhanceCtrls } from "@/logic/modifier.logic";
import { isDbSetup } from "@/logic/setup.logic";
import { SystemError } from "@/logic/SystemError";
import { makeCharacterCalcFromDb } from "@/logic/userdb.logic";
import { Team, TeammateCalc } from "@/models";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";

function toSetupOverview(setup: IDbSetup, userDb: UserdbState): SetupOverviewInfo["setup"] {
  const { userWps, userArts } = userDb;

  const main = makeCharacterCalcFromDb(setup.main, userWps, userArts);
  const team = new Team();

  const teammates = setup.teammates.map<TeammateCalc>((teammate) => {
    const data = $AppCharacter.get(teammate.code);
    let artifact: TeammateArtifact | undefined;

    if (teammate.artifact) {
      const { code, buffCtrls } = teammate.artifact;

      if (code === -1) {
        throw new SystemError({
          type: "V4_MIGRATION_ERROR",
        });
      }

      const setData = $AppArtifact.getSet(code)!;

      if (setData) {
        artifact = {
          code,
          buffCtrls: enhanceCtrls(buffCtrls, setData.buffs),
          data: setData,
        };
      }
    }

    const weaponData = $AppWeapon.get(teammate.weapon.code)!;

    return new TeammateCalc(
      {
        code: teammate.code,
        enhanced: teammate.enhanced,
        weapon: {
          code: teammate.weapon.code,
          type: teammate.weapon.type,
          refi: teammate.weapon.refi,
          buffCtrls: enhanceCtrls(teammate.weapon.buffCtrls, weaponData.buffs),
          data: weaponData,
        },
        artifact,
        buffCtrls: enhanceCtrls(teammate.buffCtrls, data.buffs),
        debuffCtrls: enhanceCtrls(teammate.debuffCtrls, data.debuffs),
      },
      data,
      team
    );
  });

  team.updateMembers([main, ...teammates]);

  return {
    ID: setup.ID,
    type: setup.type,
    name: setup.name,
    main,
    teammates,
  };
}

export function setupToOverviewInfo(
  setup: IDbSetup | IDbComplexSetup,
  userDb: UserdbState
): SetupOverviewInfo | null {
  if (isDbSetup(setup)) {
    return setup.type === "original"
      ? {
          setup: toSetupOverview(setup, userDb),
          dbSetup: setup,
        }
      : null;
  }

  const actualSetup = userDb.userSetups.find((userSetup) => userSetup.ID === setup.shownID);

  if (actualSetup && isDbSetup(actualSetup)) {
    return {
      setup: toSetupOverview(actualSetup, userDb),
      dbSetup: actualSetup,
      complexSetup: setup,
    };
  }

  return null;
}
