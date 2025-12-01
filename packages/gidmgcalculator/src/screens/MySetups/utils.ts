import type {
  SetupImportInfo,
  IDbArtifact,
  IDbSetup,
  IDbComplexSetup,
  ITeammateArtifact,
  IArtifactBuffCtrl,
} from "@/types";

import { ARTIFACT_TYPES } from "@/constants";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";
import Entity_, { createWeapon } from "@/utils/Entity";
import Modifier_ from "@/utils/Modifier";
import Object_ from "@/utils/Object";
import Setup_, { isDbSetup } from "@/utils/Setup";
import { UserdbState } from "@Store/userdb-slice";
import { SetupOverviewInfo } from "./types";
import {
  UserArtifact,
  UserArtifactGear,
  UserCharacter,
  UserTeammate,
  UserWeapon,
} from "@/models/userdb";
import { CalcTeam } from "@/models/calculator";
import { enhanceCtrls } from "@/models/userdb/utils/enhanceCtrls";

function toSetupOverview(setup: IDbSetup, userDb: UserdbState): SetupOverviewInfo["setup"] {
  const { char, weaponID, artifactIDs } = setup;
  const { userWps, userArts } = userDb;
  const data = $AppCharacter.get(char.name)!;

  // ===== WEAPON =====

  const dbWeapon = Array_.findById(userWps, weaponID);
  let weapon = dbWeapon && new UserWeapon(dbWeapon, $AppWeapon.get(dbWeapon.code)!);

  if (!weapon) {
    const defaultWeapon = createWeapon({ type: data.weaponType });
    weapon = new UserWeapon(defaultWeapon, defaultWeapon.data);
  }

  // ===== ARTIFACTS =====

  const pieces: UserArtifact[] = [];

  for (const artifactID of artifactIDs) {
    const dbArtifact = Array_.findById(userArts, artifactID);

    if (dbArtifact) {
      pieces.push(new UserArtifact(dbArtifact, $AppArtifact.getSet(dbArtifact.code)!));
    }
  }

  const artifact = new UserArtifactGear(pieces);

  // ===== CHARACTER =====

  const main = new UserCharacter(
    {
      ...char,
      weapon,
      artifact,
    },
    data
  );

  // ===== TEAMMATES =====

  const team = new CalcTeam(main);

  const teammates = setup.teammates.map<UserTeammate>((teammate) => {
    let artifact: ITeammateArtifact | undefined;

    if (teammate.artifact) {
      const data = $AppArtifact.getSet(teammate.artifact.code)!;

      artifact = {
        code: teammate.artifact.code,
        buffCtrls: enhanceCtrls(teammate.artifact.buffCtrls, data.buffs),
        data,
      };
    }

    return new UserTeammate(
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
      $AppCharacter.get(teammate.name)!,
      team
    );
  });

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
  const { userSetups, userWps, userArts } = userDb;

  if (isDbSetup(setup)) {
    return setup.type === "original"
      ? {
          setup: toSetupOverview(setup, userDb),
          dbSetup: setup,
        }
      : null;
  }

  const actualSetup = userSetups.find((userSetup) => userSetup.ID === setup.shownID);

  if (actualSetup && isDbSetup(actualSetup)) {
    return {
      setup: toSetupOverview(actualSetup, userDb),
      dbSetup: actualSetup,
      complexSetup: setup,
    };
  }

  return null;
}

export function renderInfoToImportInfo(
  info: SetupOverviewInfo,
  teammateIndex: number,
  { userChars, userWps }: UserdbState
): SetupImportInfo | null {
  const { setup } = info;
  const teammate = setup.teammates[teammateIndex];
  const mainWeapon = info.weapon;

  if (!teammate || !mainWeapon) {
    return null;
  }

  const { weapon, artifact } = teammate;
  let seedID = Date.now();

  const similarWeapon = Array_.findByCode(userWps, teammate.weapon.code);
  const actualWeapon = similarWeapon
    ? Entity_.userItemToCalcItem(similarWeapon)
    : Entity_.createWeapon(
        {
          code: weapon.code,
          type: weapon.type,
        },
        seedID++
      );

  let artifacts: IDbArtifact[] = [];

  if (artifact.code) {
    const { variants = [] } = $AppArtifact.getSet(artifact.code) || {};
    const maxRarity = variants.at(-1);

    if (maxRarity) {
      artifacts = ARTIFACT_TYPES.map((type) => {
        return Entity_.createArtifact(
          {
            code: artifact.code,
            rarity: maxRarity,
            type,
          },
          seedID++
        );
      });
    }
  }

  const teammates = Object_.clone(setup.teammates);
  const [tmBuffCtrls, tmDebuffCtrls] = Modifier_.createCharacterModCtrls(teammate.name, false);

  teammates[teammateIndex] = {
    name: setup.char.name,
    weapon: {
      code: mainWeapon.code,
      type: mainWeapon.type,
      refi: mainWeapon.refi,
      buffCtrls: Modifier_.createWeaponBuffCtrls(mainWeapon, false),
    },
    artifact: {
      code: 0,
      buffCtrls: [],
    },
    buffCtrls: tmBuffCtrls,
    debuffCtrls: tmDebuffCtrls,
  };

  return {
    ID: seedID++,
    name: "New setup",
    target: setup.target,
    calcSetup: Setup_.createCalcSetup({
      char: Entity_.createCharacter(teammate.name, Array_.findByName(userChars, teammate.name)),
      weapon: actualWeapon,
      artifacts,
      party,
    }),
  };
}
