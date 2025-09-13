import { ARTIFACT_TYPES } from "@Calculation";
import { $AppArtifact } from "@/services";
import type { CalcArtifacts, SetupImportInfo, UserComplexSetup, UserSetup } from "@/types";
import Array_ from "@/utils/array-utils";
import Entity_ from "@/utils/entity-utils";
import Modifier_ from "@/utils/modifier-utils";
import Object_ from "@/utils/object-utils";
import Setup_ from "@/utils/setup-utils";
import { UserdbState } from "@Store/userdb-slice";
import { SetupRenderInfo } from "./types";

export function parseSetup(setup: UserSetup | UserComplexSetup, setups: (UserSetup | UserComplexSetup)[]) {
  if (Setup_.isUserSetup(setup)) {
    return setup.type === "original" ? { setup } : null;
  }

  const actualSetup = setups.find((userSetup) => userSetup.ID === setup.shownID);

  if (actualSetup && Setup_.isUserSetup(actualSetup)) {
    return {
      setup: actualSetup,
      complexSetup: setup,
    };
  }

  return null;
}

export function renderInfoToImportInfo(
  info: SetupRenderInfo,
  teammateIndex: number,
  userdb: UserdbState
): SetupImportInfo | null {
  const { setup } = info;
  const teammate = setup.party[teammateIndex];
  const mainWeapon = info.weapon;

  if (!teammate || !mainWeapon) {
    return null;
  }

  const { userChars, userWps } = userdb;
  const { weapon, artifact } = teammate;
  const [selfBuffCtrls, selfDebuffCtrls] = Modifier_.createCharacterModCtrls(true, teammate.name);
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

  let artifacts: CalcArtifacts = [null, null, null, null, null];

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

  const party = Object_.clone(setup.party);
  const [tmBuffCtrls, tmDebuffCtrls] = Modifier_.createCharacterModCtrls(false, teammate.name);

  party[teammateIndex] = {
    name: setup.char.name,
    weapon: {
      code: mainWeapon.code,
      type: mainWeapon.type,
      refi: mainWeapon.refi,
      buffCtrls: Modifier_.createWeaponBuffCtrls(false, mainWeapon),
    },
    artifact: {
      code: 0,
      buffCtrls: [],
    },
    buffCtrls: tmBuffCtrls,
    debuffCtrls: tmDebuffCtrls,
  };

  const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(artifacts);

  return {
    ID: seedID++,
    name: "New setup",
    target: setup.target,
    calcSetup: {
      char: Entity_.createCharacter(teammate.name, Array_.findByName(userChars, teammate.name)),
      selfBuffCtrls,
      selfDebuffCtrls,
      weapon: actualWeapon,
      wpBuffCtrls: Modifier_.createWeaponBuffCtrls(true, actualWeapon),
      artifacts,
      artBuffCtrls,
      artDebuffCtrls: Modifier_.createArtifactDebuffCtrls(),
      party,
      elmtModCtrls: Modifier_.createElmtModCtrls(),
      customBuffCtrls: [],
      customDebuffCtrls: [],
      customInfusion: { element: "phys" },
    },
  };
}
