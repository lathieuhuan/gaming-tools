import { Array_ } from "ron-utils";

import type { AttributeStat, BonusSpec, ModAffectType } from "@/types";
import type { Bonus, BonusGroup, BonusGroupMeta } from "../Member";
import type { Team } from "./Team";
import type { MemberOperations } from "./types";

import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";
import { getBonusRecipients } from "../../logic/getBonusRecipients";

export function applyInnateBonuses(team: Team) {
  const { memberList } = team;
  const { resonances } = team.state;

  // ===== RESONANCE =====

  if (resonances.length > 0) {
    const groupId = "auto-rsn";
    const rsnGroup: BonusGroup = {
      meta: {
        id: groupId,
        src: "Resonance",
        innate: true,
        affect: "PARTY",
      },
      bonuses: [],
    };

    for (const elmt of resonances) {
      const bonus = AUTO_RESONANCE_STATS[elmt];

      rsnGroup.bonuses.push({
        type: "ATTR",
        groupId,
        value: bonus.value,
        toStat: bonus.key,
      });
    }

    for (const member of memberList) {
      member.bonusCtrl.addInnateBonusGroup(rsnGroup);
    }
  }

  for (const member of memberList) {
    const { code, innateBuffs = [] } = member.data;
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
        src: `${member.data.name} / ${buff.src}`,
        innate: true,
        affect: buff.affect,
      };

      for (const spec of specCates.fiSpecs) {
        applyMemberInnateBonus(meta, spec, memberOps, buff.affect);
      }
    }
  }
}

function applyMemberInnateBonus(
  meta: BonusGroupMeta,
  spec: BonusSpec,
  memberOps: MemberOperations,
  affect?: ModAffectType
) {
  const bareBonus = memberOps.act.performBonus(spec);
  if (!bareBonus.value) return;

  const recipients = getBonusRecipients(memberOps.member, memberOps.team, spec.affect || affect);
  if (recipients.length === 0) return;

  const groupId = meta.id;

  switch (spec.target.module) {
    case "TLT":
      break;
    case "ATTR": {
      for (const path of Array_.toArray(spec.target.path)) {
        const toStat = memberOps.act.resolveBonusTargetPath(path);
        if (!toStat) continue;

        const bonus: Bonus = {
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
      for (const module of Array_.toArray(spec.target.module)) {
        const bonus: Bonus = {
          type: "ATTK",
          groupId,
          toType: module,
          toKey: spec.target.path,
          value: bareBonus.value,
        };

        for (const recipient of recipients) {
          recipient.bonusCtrl.addInnateBonus(meta, bonus);
        }
      }
    }
  }
}

const AUTO_RESONANCE_STATS: Record<string, { key: AttributeStat; value: number }> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

// if (this.members.has(26)) {
//   // "Tartaglia"
//   tltSpecs.push({
//     meta: {
//       id: "c26-i",
//       src: "Tartaglia / Ultility Passive",
//       innate: true,
//       affect: "PARTY",
//     },
//     ownerCode: 26,
//     spec: {
//       id: "c26-i",
//       value: 1,
//       target: { module: "TLT", path: "NAs" },
//     },
//   });
// }

// if (this.members.has(105)) {
//   // "Skirk"
//   const isValid = this.state.isTeamElmtValid({
//     teamOnlyElmts: ["hydro", "cryo"],
//     teamEachElmtCount: { hydro: 1, cryo: 1 },
//   });

//   if (isValid) {
//     tltSpecs.push({
//       meta: {
//         id: "c105-i",
//         src: "Skirk / Ultility Passive",
//         innate: true,
//         affect: "PARTY",
//       },
//       ownerCode: 105,
//       spec: {
//         id: "c105-i",
//         value: 1,
//         target: { module: "TLT", path: "ES" },
//       },
//     });
//   }
// }
