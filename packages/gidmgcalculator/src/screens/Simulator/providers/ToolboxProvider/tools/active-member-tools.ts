import type { TalentEventConfig, TotalAttribute } from "@Backend";
import type { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

type TotalAttrSubscriber = (totalAttr: TotalAttribute) => void;

type _ConfigTalentHitEvent = (args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => TalentEventConfig;

export class ActiveMemberTools {
  private member: MemberControl;
  private totalAttrSubscribers: Set<TotalAttrSubscriber> = new Set();
  configTalentHitEvent: _ConfigTalentHitEvent;

  constructor(member: MemberControl, configTalentHitEvent: _ConfigTalentHitEvent) {
    this.member = member;
    this.configTalentHitEvent = configTalentHitEvent;

    this.member.listenTotalAttrChange((ctrl) => {
      this.totalAttrSubscribers.forEach((callback) => callback(ctrl.finalize()));
    });
  }

  subscribeTotalAttr = (subscribe: TotalAttrSubscriber) => {
    this.totalAttrSubscribers.add(subscribe);

    return {
      initialTotalAttr: this.member.totalAttr.finalize(),
      unsubscribe: () => {
        this.totalAttrSubscribers.delete(subscribe);
      },
    };
  };
}
