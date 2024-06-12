import type { TalentEventConfig } from "@Backend";
import type { ConfigTalentHitEventArgs, MemberControl, OnChangeBonuses, OnChangeTotalAttr } from "./member-control";

type _ConfigTalentHitEvent = (args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => TalentEventConfig;

export class ActiveMemberTools {
  private member: MemberControl;
  private totalAttrSubscribers: Set<OnChangeTotalAttr> = new Set();
  private bonusesSubscribers: Set<OnChangeBonuses> = new Set();
  configTalentHitEvent: _ConfigTalentHitEvent;

  constructor(member: MemberControl, configTalentHitEvent: _ConfigTalentHitEvent) {
    this.member = member;
    this.configTalentHitEvent = configTalentHitEvent;

    this.member.listenChanges(
      (totalAttr) => {
        console.log("totalAttrSubscribers count:", this.totalAttrSubscribers.size);

        this.totalAttrSubscribers.forEach((callback) => callback(totalAttr));
      },
      (bonuses) => {
        console.log("bonusesSubscribers count:", this.bonusesSubscribers.size);

        this.bonusesSubscribers.forEach((callback) => callback(bonuses));
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
      initialBonuses: this.member.getBonuses(),
      unsubscribe: () => {
        this.bonusesSubscribers.delete(subscribe);
      },
    };
  };
}
