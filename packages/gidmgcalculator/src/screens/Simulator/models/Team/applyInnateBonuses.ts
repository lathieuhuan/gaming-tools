import { Array_ } from "ron-utils";

import type {
  AttributeStat,
  AutoRsnElmtType,
  BareBonus,
  BonusTargetSpec,
  ModAffectType,
} from "@/types";
import type {
  AttackBonus,
  AttributeBonus,
  BonusGroup,
  BonusGroupMeta,
  TalentLevelBonus,
} from "../Member";
import type { Team } from "./Team";
import type { MemberOperations } from "./types";

import { isAutoRsnElmt } from "@/logic/element.logic";
import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";
import { getBonusRecipients } from "../../logic/getBonusRecipients";

export function applyInnateBonuses(team: Team) {
  const { memberList } = team;
  const { elmtCount } = team.state;

  {
    // ===== RESONANCE =====
    const groupId = "auto-rsn";
    const bonuses: AttributeBonus[] = [];

    elmtCount.forEach((elmt, count) => {
      if (isAutoRsnElmt(elmt) && count >= 2) {
        const bonus = AUTO_RESONANCE_BONUSES[elmt];

        bonuses.push({
          type: "ATTR",
          groupId,
          value: bonus.value,
          toStat: bonus.stat,
        });
      }
    });

    if (bonuses.length > 0) {
      const rsnGroup: BonusGroup = {
        meta: {
          id: groupId,
          src: "Resonance",
          innate: true,
          affect: "PARTY",
        },
        bonuses,
      };

      for (const member of memberList) {
        member.bonusCtrl.addInnateBonusGroup(rsnGroup);
      }
    }
  }

  // ===== INNATE BUFFS =====

  for (const member of memberList) {
    const { weapon, atfGear } = member;
    const { code, name, innateBuffs = [] } = member.data;
    const memberOps = team.getMemberOps(member);

    // ===== INNATE BUFFS =====
    for (const buff of innateBuffs) {
      if (!buff.effects || !memberOps.can.performEffect(buff)) {
        continue;
      }

      const specCates = categorizeBonusSpecs(buff.effects, memberOps.can);

      if (!specCates) {
        continue;
      }

      const meta: BonusGroupMeta = {
        id: `c${code}-i`,
        src: `${name} / ${buff.src}`,
        innate: true,
        affect: buff.affect,
      };

      for (const spec of specCates.fiSpecs) {
        const bareBonus = memberOps.act.performBonus(spec);
        const affect = buff.affect || spec.affect;

        applyMemberInnateBonus(meta, memberOps, bareBonus, spec.target, affect);
      }

      // TODO apply dynamic bonuses
    }

    weaponBonuses: {
      const { data } = weapon;
      if (!data.bonuses) break weaponBonuses;

      const meta: BonusGroupMeta = {
        id: `c${code}-w${data.code}-i`,
        src: `${name} / ${data.name}`,
        innate: true,
      };

      for (const spec of data.bonuses) {
        const bareBonus = memberOps.act.performBonus(spec, { refi: weapon.refi });

        applyMemberInnateBonus(meta, memberOps, bareBonus, spec.target, spec.affect);
      }
    }

    // ===== ARTIFACT BONUSES =====
    atfGear.forEachSetBonus((specs, { data }) => {
      const meta: BonusGroupMeta = {
        id: `c${code}-a${data.code}-i`,
        src: `${name} / ${data.name}`,
        innate: true,
      };

      for (const spec of Array_.toArray(specs)) {
        const bareBonus = memberOps.act.performBonus(spec);

        applyMemberInnateBonus(meta, memberOps, bareBonus, spec.target, spec.affect);
      }
    });
  }
}

function applyMemberInnateBonus(
  meta: BonusGroupMeta,
  memberOps: MemberOperations,
  bareBonus: BareBonus,
  target: BonusTargetSpec,
  affect?: ModAffectType
) {
  if (!bareBonus.value) return;

  const recipients = getBonusRecipients(memberOps.member, memberOps.team, affect);
  if (recipients.length === 0) return;

  const groupId = meta.id;

  switch (target.module) {
    case "TLT": {
      const bonus: TalentLevelBonus = {
        type: "TLLV",
        groupId,
        toType: target.path,
        value: bareBonus.value,
      };

      for (const recipient of recipients) {
        recipient.bonusCtrl.addInnateBonus(meta, bonus);
      }
      break;
    }
    case "ATTR": {
      for (const path of Array_.toArray(target.path)) {
        const toStat = memberOps.act.resolveBonusTargetPath(path);
        if (!toStat) continue;

        const bonus: AttributeBonus = {
          type: "ATTR",
          groupId,
          toStat,
          value: bareBonus.value,
          isDynamic: bareBonus.isDynamic,
        };

        for (const recipient of recipients) {
          recipient.bonusCtrl.addInnateBonus(meta, bonus);
        }
      }
      break;
    }
    default: {
      for (const module of Array_.toArray(target.module)) {
        const bonus: AttackBonus = {
          type: "ATTK",
          groupId,
          toType: module,
          toKey: target.path,
          value: bareBonus.value,
        };

        for (const recipient of recipients) {
          recipient.bonusCtrl.addInnateBonus(meta, bonus);
        }
      }
    }
  }
}

// TODO move to backend as innate team buffs
const AUTO_RESONANCE_BONUSES: Record<AutoRsnElmtType, { stat: AttributeStat; value: number }> = {
  pyro: { stat: "atk_", value: 25 },
  geo: { stat: "shieldS_", value: 15 },
  hydro: { stat: "hp_", value: 25 },
  dendro: { stat: "em", value: 50 },
};
