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
    // #here: wrong, this is change active not on field
    // this.activeMember?.switch('out');
    this.activeMember = newActiveMember;
    // this.activeMember.switch('in');

    setTimeout(() => {
      this.notifySubscribers();
    }, 0);
  };

  notifySubscribers = () => {
    const totalAttr = this.activeMember.totalAttr;
    const attrBonus = this.activeMember.attrBonus;
    const attkBonus = this.activeMember.attkBonus;

    this.totalAttrSubscribers.forEach((callback) => callback(totalAttr));
    this.bonusesSubscribers.forEach((callback) => callback(attrBonus, attkBonus));
  };

  subscribeTotalAttr = (subscribe: OnChangeTotalAttr) => {
    this.totalAttrSubscribers.add(subscribe);

    return {
      initialTotalAttr: this.activeMember.totalAttr,
      unsubscribe: () => {
        this.totalAttrSubscribers.delete(subscribe);
      },
    };
  }

  subscribeBonuses = (subscribe: OnChangeBonuses) => {
    this.bonusesSubscribers.add(subscribe);

    return {
      initial: {
        attrBonus: this.activeMember.attrBonus,
        attkBonus: this.activeMember.attkBonus,
      },
      unsubscribe: () => {
        this.bonusesSubscribers.delete(subscribe);
      },
    };
  }
}
