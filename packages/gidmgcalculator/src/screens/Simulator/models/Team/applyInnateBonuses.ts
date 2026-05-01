import { Array_ } from "ron-utils";

import type { AttributeStat, BonusSpec } from "@/types";
import type { Bonus, BonusGroup } from "../Member";
import type { Team } from "./Team";

import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";
import { getBonusRecipients } from "../../logic/getBonusRecipients";
import { MemberAct } from "../../logic/memberAct";

export function applyInnateBonuses(team: Team) {
  const commonGroups: BonusGroup[] = [];
  const { memberList } = team;
  const { resonances } = team.state;

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

    commonGroups.push(rsnGroup);
  }

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

  for (const member of memberList) {
    for (const group of commonGroups) {
      member.bonusCtrl.addInnateBonusGroup(group);
    }

    const { code, innateBuffs = [] } = member.data;
    const memberOps = team.getMemberOps(member);

    for (const buff of innateBuffs) {
      if (!buff.effects || !memberOps.can.performEffect(buff)) {
        continue;
      }

      const specCates = categorizeBonusSpecs(buff.effects, memberOps.can);

      if (!specCates) {
        continue;
      }

      const groupId = `c${code}-i`;

      const group: BonusGroup = {
        meta: {
          id: groupId,
          src: `${member.data.name} / ${buff.src}`,
          innate: true,
          affect: buff.affect,
        },
        bonuses: resolveInnateBonusSpecs(groupId, specCates?.fiSpecs, memberOps.act),
      };

      const recipients = getBonusRecipients(member, team, buff.affect);

      recipients.forEach((recipient) => {
        recipient.bonusCtrl.addInnateBonusGroup(group);
      });
    }
  }
}

function resolveInnateBonusSpecs(
  groupId: string,
  specs: BonusSpec[],
  memberAct: MemberAct
): Bonus[] {
  const bonuses: Bonus[] = [];

  for (const spec of specs) {
    const bareBonus = memberAct.performBonus(spec);

    switch (spec.target.module) {
      case "TLT": {
        //
        break;
      }
      case "ATTR": {
        for (const path of Array_.toArray(spec.target.path)) {
          const toStat = memberAct.resolveBonusTargetPath(path);
          if (!toStat) continue;

          bonuses.push({
            type: "ATTR",
            groupId,
            toStat,
            value: bareBonus.value,
            isDynamic: bareBonus.isDynamic,
          });
        }
        break;
      }
      default: {
        for (const module of Array_.toArray(spec.target.module)) {
          bonuses.push({
            type: "ATTK",
            groupId,
            toType: module,
            toKey: spec.target.path,
            value: bareBonus.value,
          });
        }
      }
    }
  }

  return bonuses;
}

const AUTO_RESONANCE_STATS: Record<string, { key: AttributeStat; value: number }> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};
