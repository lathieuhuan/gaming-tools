import type { AppArtifact, ArtifactBuff, WeaponBuff } from "@/types";
import type { EffectToParseText } from "../models/EffectValueCalcs";
import type { Member } from "../models/Member";
import type { Team } from "../models/Team";

import { getArtifactDesc, getWeaponBuffDesc } from "@/utils/descriptionParsers";
import { BonusCalc } from "../models/EffectValueCalcs";

export function memberShow(member: Member, team: Team) {
  //
  function abilityBuffText(spec: EffectToParseText, inputs?: number[]) {
    return new BonusCalc(member, team, { inputs }).parseAbilityText(spec);
  }

  function weaponBuffText(buff: WeaponBuff) {
    const { data, refi } = member.weapon;
    return getWeaponBuffDesc(data.descriptions, buff, refi);
  }

  function artifactBuffText(buff: ArtifactBuff, setData: AppArtifact) {
    return getArtifactDesc(setData, buff);
  }

  return {
    member,
    team,
    abilityBuffText,
    weaponBuffText,
    artifactBuffText,
  };
}

export type MemberShow = ReturnType<typeof memberShow>;
