import type { DbComplexSetup, DbSetup } from "@/types";
import type { UserdbState } from "@Store/userdbSlice";
import type { SetupOverviewInfo } from "../types";

import { createTeammate } from "@/logic/entity.logic";
import { isDbSetup } from "@/logic/setup.logic";
import { makeCharacterCalcFromDb } from "@/logic/userdb.logic";
import { Team } from "@/models/Team";

function toSetupOverview(setup: DbSetup, userDb: UserdbState): SetupOverviewInfo["setup"] {
  const { userWps, userArts } = userDb;

  const main = makeCharacterCalcFromDb(setup.main, userWps, userArts);
  const team = new Team();

  const teammates = setup.teammates.map((teammate) => {
    return createTeammate(teammate, null, { team });
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
  setup: DbSetup | DbComplexSetup,
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
