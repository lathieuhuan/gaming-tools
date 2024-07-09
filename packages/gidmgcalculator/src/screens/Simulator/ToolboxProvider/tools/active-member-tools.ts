import type { ActualAttackPattern, CalcItemRecord } from "@Backend";
import type { MemberControl, OnChangeBonuses, OnChangeTotalAttr } from "./member-control";

export type TalentEventConfig = {
  damage: number | number[];
  attPatt: ActualAttackPattern;
  attElmt: "pyro" | "hydro" | "electro" | "cryo" | "geo" | "anemo" | "dendro" | "phys";
  record: CalcItemRecord;
};

export class ActiveMemberTools {
  private totalAttrSubscribers = new Set<OnChangeTotalAttr>();
  private bonusesSubscribers = new Set<OnChangeBonuses>();

  constructor(private member: MemberControl) {
    member.listenChanges(
      (totalAttr) => {
        this.totalAttrSubscribers.forEach((callback) => callback(totalAttr));
      },
      (attrBonus, attkBonus) => {
        this.bonusesSubscribers.forEach((callback) => callback(attrBonus, attkBonus));
      }
    );
  }

  subscribeTotalAttr = (subscribe: OnChangeTotalAttr) => {
    this.totalAttrSubscribers.add(subscribe);

    return {
      initialTotalAttr: this.member.totalAttr,
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
