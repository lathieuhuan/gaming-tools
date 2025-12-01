import type {
  CharacterDebuff,
  EntityModifier,
  IArtifactBuffCtrl,
  IDbArtifact,
  IDbSetup,
  IDbWeapon,
  IModifierCtrlBasic,
} from "@/types";
import type { Target } from "../base";
import type { CalcTeam, CalcTeammate } from "../calculator";
import { UserCharacter } from "./UserCharacter";

import { Setup } from "../base/Setup";
import { UserWeapon } from "./UserWeapon";
import Array_ from "@/utils/Array";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import { createWeapon } from "@/utils/Entity";
import { UserArtifact } from "./UserArtifact";
import { UserArtifactGear } from "./UserArtifactGear";
import { enhanceCtrls } from "./utils/enhanceCtrls";

export class UserSetup extends Setup<UserCharacter, CalcTeammate, CalcTeam, Target> {
  static fromDb(setup: IDbSetup, weapons: IDbWeapon[], artifacts: IDbArtifact[]) {
    const {
      char,
      selfBuffCtrls,
      selfDebuffCtrls,
      wpBuffCtrls,
      artDebuffCtrls,
      teamBuffCtrls,
      teammates,
      elmtEvent,
      customBuffCtrls,
      customDebuffCtrls,
      weaponID,
      artifactIDs,
      target,
      ...rest
    } = setup;

    const data = $AppCharacter.get(char.name)!;

    // ===== WEAPON =====

    const dbWeapon = Array_.findById(weapons, weaponID);
    let weapon = dbWeapon && new UserWeapon(dbWeapon, $AppWeapon.get(dbWeapon.code)!);

    if (!weapon) {
      const defaultWeapon = createWeapon({ type: data.weaponType });
      weapon = new UserWeapon(defaultWeapon, defaultWeapon.data);
    }

    // ===== ARTIFACTS =====

    const pieces: UserArtifact[] = [];

    for (const artifactID of artifactIDs) {
      const dbArtifact = Array_.findById(artifacts, artifactID);

      if (dbArtifact) {
        pieces.push(new UserArtifact(dbArtifact, $AppArtifact.getSet(dbArtifact.code)!));
      }
    }

    const artifact = new UserArtifactGear(pieces);

    // ===== CHARACTER =====

    const character = new UserCharacter(
      {
        ...char,
        weapon,
        artifact,
      },
      data
    );

    // ===== MODIFIERS =====

    const artBuffCtrls: IArtifactBuffCtrl[] = [];

    return new UserSetup({
      ID: setup.ID,
      char: character,
      selfBuffCtrls: enhanceCtrls(selfBuffCtrls, data.buffs),
      selfDebuffCtrls: enhanceCtrls(selfDebuffCtrls, data.debuffs),
      wpBuffCtrls: enhanceCtrls(wpBuffCtrls, weapon.data.buffs),
      artBuffCtrls,
      artDebuffCtrls,
    });
  }
}
