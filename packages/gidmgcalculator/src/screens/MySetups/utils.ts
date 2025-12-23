import type { IDbComplexSetup, IDbSetup, ITeammateArtifact } from "@/types";
import type { UserdbState } from "@Store/userdb-slice";
import type { SetupOverviewInfo } from "./types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { Artifact, ArtifactGear, CalcCharacter, Team } from "@/models/base";
import {
  CalcSetup,
  CalcTeammate,
  createAbilityBuffCtrls,
  createAbilityDebuffCtrls,
  createWeaponBuffCtrls,
} from "@/models/calculator";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";
import {
  createArtifact,
  createCharacterBasic,
  createTarget,
  createWeapon,
  createWeaponBasic,
} from "@/utils/entity-utils";
import IdStore from "@/utils/IdStore";
import { enhanceCtrls } from "@/utils/modifier-utils";
import { isDbSetup } from "@/utils/setup-utils";
import { makeCalcCharacterFromDb } from "@/utils/userdb";
import { SystemError } from "@/utils/SystemError";

export function toSetupOverview(setup: IDbSetup, userDb: UserdbState): SetupOverviewInfo["setup"] {
  const { userWps, userArts } = userDb;

  const main = makeCalcCharacterFromDb(setup.main, userWps, userArts);
  const team = new Team();

  const teammates = setup.teammates.map<CalcTeammate>((teammate) => {
    const data = $AppCharacter.get(teammate.name)!;
    let artifact: ITeammateArtifact | undefined;

    if (teammate.artifact) {
      if (teammate.artifact.code === -1) {
        throw new SystemError({
          type: "V4_MIGRATION_ERROR",
        });
      }

      const setData = $AppArtifact.getSet(teammate.artifact.code)!;

      if (setData) {
        artifact = {
          code: teammate.artifact.code,
          buffCtrls: enhanceCtrls(teammate.artifact.buffCtrls, setData.buffs),
          data: setData,
        };
      }
    }

    return new CalcTeammate(
      {
        name: teammate.name,
        enhanced: teammate.enhanced,
        weapon: {
          code: teammate.weapon.code,
          type: teammate.weapon.type,
          refi: teammate.weapon.refi,
          buffCtrls: enhanceCtrls(teammate.weapon.buffCtrls, data.buffs),
          data: $AppWeapon.get(teammate.weapon.code)!,
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

export function toOverviewInfo(
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

export function createSetupForTeammate(
  info: SetupOverviewInfo,
  teammateIndex: number,
  { userChars, userWps }: UserdbState
) {
  const { setup, dbSetup } = info;
  const teammates = [...setup.teammates];
  const idStore = new IdStore();

  // Make new main from teammate

  const teammate = teammates[teammateIndex];
  const { weapon, artifact } = teammate;

  const similarWeapon = Array_.findByCode(userWps, teammate.weapon.code);
  const weaponBasic = similarWeapon || createWeaponBasic(weapon, idStore);

  let artifacts: Artifact[] = [];

  if (artifact?.code) {
    const atfData = $AppArtifact.getSet(artifact.code)!;
    const maxRarity = atfData.variants.at(-1);

    if (maxRarity) {
      artifacts = ARTIFACT_TYPES.map((type) => {
        return createArtifact(
          {
            ...artifact,
            type,
            rarity: maxRarity,
          },
          atfData,
          idStore
        );
      });
    }
  }

  const newMainBasic =
    Array_.findByName(userChars, teammate.name) || createCharacterBasic(teammate);

  const newMain = new CalcCharacter(
    {
      ...newMainBasic,
      weapon: createWeapon(weaponBasic),
      atfGear: new ArtifactGear(artifacts),
    },
    teammate.data
  );

  // Place old main into the teammate's slot

  const team = new Team();

  const { main } = setup;
  const mainWeapon = main.weapon;

  teammates[teammateIndex] = new CalcTeammate(
    {
      ...main,
      weapon: {
        code: mainWeapon.code,
        type: mainWeapon.type,
        refi: mainWeapon.refi,
        buffCtrls: createWeaponBuffCtrls(mainWeapon.data, false),
        data: mainWeapon.data,
      },
      buffCtrls: createAbilityBuffCtrls(main.data, false),
      debuffCtrls: createAbilityDebuffCtrls(main.data, false),
    },
    main.data,
    team
  );

  team.updateMembers([newMain, ...teammates]);

  return new CalcSetup({
    ID: idStore.gen(),
    main: newMain,
    team,
    teammates,
    target: createTarget(dbSetup.target),
  });
}
