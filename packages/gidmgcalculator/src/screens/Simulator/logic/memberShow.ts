import type { EffectToParseText } from "../models/EffectValueCalcs";
import type { Member } from "../models/Member";
import type { Team } from "../models/Team";

import { BonusCalc } from "../models/EffectValueCalcs";
import { getWeaponBuffDesc } from "@/utils/descriptionParsers";
import { WeaponBuff } from "@/types";

export function memberShow(member: Member, team: Team) {
  //
  function abilityBuffText(spec: EffectToParseText, inputs?: number[]) {
    return new BonusCalc(member, team, { inputs }).parseAbilityText(spec);
  }

  function weaponBuffText(buff: WeaponBuff) {
    const { data, refi } = member.weapon;
    return getWeaponBuffDesc(data.descriptions, buff, refi);
  }

  return {
    member,
    team,
    abilityBuffText,
    weaponBuffText,
  };
}

export type MemberShow = ReturnType<typeof memberShow>;
