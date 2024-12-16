import type { TotalAttribute } from "@Backend";
import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import type { MemberControl } from "./member-control";

export type OnChangeTotalAttr = (totalAttrCtrl: TotalAttribute) => void;

export type OnChangeBonuses = (attrBonus: SimulationAttributeBonus[], attkBonus: SimulationAttackBonus[]) => void;

export class ActiveMemberWatcher {
  private totalAttrSubscribers = new Set<OnChangeTotalAttr>();
  private bonusesSubscribers = new Set<OnChangeBonuses>();

  constructor(private activeMember: MemberControl) {}

  changeActiveMember = (newActiveMember: MemberControl) => {
    this.activeMember = newActiveMember;
    // Apply party bonuses to update TotalAttribute
    this.activeMember.applyBonuses();

    setTimeout(() => {
      this.notifySubscribers();
    }, 0);
  };

  notifySubscribers = () => {
    const totalAttr = this.activeMember.totalAttr;
    const attrBonuses = this.activeMember.attrBonuses;
    const attkBonuses = this.activeMember.attkBonuses;

    this.totalAttrSubscribers.forEach((callback) => callback(totalAttr));
    this.bonusesSubscribers.forEach((callback) => callback(attrBonuses, attkBonuses));
  };

  subscribeTotalAttr = (subscribe: OnChangeTotalAttr) => {
    this.totalAttrSubscribers.add(subscribe);

    return {
      initialTotalAttr: this.activeMember.totalAttr,
      unsubscribe: () => {
        this.totalAttrSubscribers.delete(subscribe);
      },
    };
  };

  subscribeBonuses = (subscribe: OnChangeBonuses) => {
    this.bonusesSubscribers.add(subscribe);

    return {
      initial: {
        attrBonuses: this.activeMember.attrBonuses,
        attkBonuses: this.activeMember.attkBonuses,
      },
      unsubscribe: () => {
        this.bonusesSubscribers.delete(subscribe);
      },
    };
  };
}
