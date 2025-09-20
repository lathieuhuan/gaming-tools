import { ARTIFACT_TYPES } from "@Calculation";
import { $AppArtifact } from "@/services";
import type { CalcArtifacts, SetupImportInfo, UserComplexSetup, UserSetup } from "@/types";
import Array_ from "@/utils/Array";
import Entity_ from "@/utils/Entity";
import Modifier_ from "@/utils/Modifier";
import Object_ from "@/utils/Object";
import Setup_ from "@/utils/Setup";
import { UserdbState } from "@Store/userdb-slice";
import { SetupRenderInfo } from "./types";

export function parseSetup(
  setup: UserSetup | UserComplexSetup,
  setups: (UserSetup | UserComplexSetup)[]
) {
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
  { userChars, userWps }: UserdbState
): SetupImportInfo | null {
  const { setup } = info;
  const teammate = setup.party[teammateIndex];
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
  const [tmBuffCtrls, tmDebuffCtrls] = Modifier_.createCharacterModCtrls(teammate.name, false);

  party[teammateIndex] = {
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
