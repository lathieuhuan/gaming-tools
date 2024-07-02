import type { ActualAttackPattern, CalcItemRecord } from "@Backend";
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
  private totalAttrSubscribers = new Set<OnChangeTotalAttr>();
  private bonusesSubscribers = new Set<OnChangeBonuses>();
  configTalentHitEvent: ConfigTalentHitEvent;

  constructor(member: MemberControl, configTalentHitEvent: ConfigTalentHitEvent) {
    this.member = member;
    this.configTalentHitEvent = configTalentHitEvent;

    this.member.listenChanges(
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
