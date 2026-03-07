import { Array_ } from "ron-utils";

import type { UserdbState } from "@Store/userdbSlice";
import type { SetupOverviewInfo } from "../types";

import { ARTIFACT_TYPES } from "@/constants/global";
import {
  createArtifact,
  createCharacterCalc,
  createTarget,
  createWeapon,
  createWeaponBasic,
} from "@/logic/entity.logic";
import {
  createAbilityBuffCtrls,
  createAbilityDebuffCtrls,
  createWeaponBuffCtrls,
} from "@/logic/modifier.logic";
import { Artifact, ArtifactGear, CalcSetup, Team, TeammateCalc } from "@/models";
import { $AppArtifact } from "@/services";
import IdStore from "@/utils/IdStore";

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

  const newMain = createCharacterCalc(
    {
      ...Array_.findByCode(userChars, teammate.code),
      code: teammate.code,
      weapon: createWeapon(weaponBasic),
      atfGear: new ArtifactGear(artifacts),
    },
    teammate.data
  );

  // Place old main into the teammate's slot

  const team = new Team();

  const { main } = setup;
  const mainWeapon = main.weapon;

  teammates[teammateIndex] = new TeammateCalc(
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
