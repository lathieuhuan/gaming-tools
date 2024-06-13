import { ActualAttackPattern, CalcItemRecord } from "@Backend";
import type { ConfigTalentHitEventArgs, MemberControl, OnChangeBonuses, OnChangeTotalAttr } from "./member-control";

export type TalentEventConfig = {
  damage: number | number[];
  attPatt: ActualAttackPattern;
  attElmt: "pyro" | "hydro" | "electro" | "cryo" | "geo" | "anemo" | "dendro" | "phys";
  record: CalcItemRecord;
};

type ConfigTalentHitEvent = (args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => TalentEventConfig;

export class ActiveMemberTools {
  private member: MemberControl;
  private totalAttrSubscribers: Set<OnChangeTotalAttr> = new Set();
  private bonusesSubscribers: Set<OnChangeBonuses> = new Set();
  configTalentHitEvent: ConfigTalentHitEvent;

  constructor(member: MemberControl, configTalentHitEvent: ConfigTalentHitEvent) {
    this.member = member;
    this.configTalentHitEvent = configTalentHitEvent;

    this.member.listenChanges(
      (totalAttr) => {
        console.log("totalAttrSubscribers count:", this.totalAttrSubscribers.size);

        this.totalAttrSubscribers.forEach((callback) => callback(totalAttr));
      },
      (attrBonus, attkBonus) => {
        console.log("bonusesSubscribers count:", this.bonusesSubscribers.size);

        this.bonusesSubscribers.forEach((callback) => callback(attrBonus, attkBonus));
      }
    );
  }

  subscribeTotalAttr = (subscribe: OnChangeTotalAttr) => {
    this.totalAttrSubscribers.add(subscribe);

    return {
      initialTotalAttr: this.member.totalAttr.finalize(),
      unsubscribe: () => {
        this.totalAttrSubscribers.delete(subscribe);
      },
    };
  };

  subscribeBonuses = (subscribe: OnChangeBonuses) => {
    this.bonusesSubscribers.add(subscribe);

    return {
      initial: {
        attrBonus: this.member.attrBonus,
        attkBonus: this.member.attkBonus,
      },
      unsubscribe: () => {
        this.bonusesSubscribers.delete(subscribe);
      },
    };
  };
}
