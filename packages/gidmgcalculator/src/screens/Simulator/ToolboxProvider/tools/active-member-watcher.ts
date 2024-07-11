import type { ActualAttackPattern, CalcItemRecord } from "@Backend";
import type { SimulationMember, SimulationTarget } from "@Src/types";
import type { OnChangeBonuses, OnChangeTotalAttr } from "./member-control";
import { SimulationControlStarter } from "./simulation-control-starter";

export type TalentEventConfig = {
  damage: number | number[];
  attPatt: ActualAttackPattern;
  attElmt: "pyro" | "hydro" | "electro" | "cryo" | "geo" | "anemo" | "dendro" | "phys";
  record: CalcItemRecord;
};

export class ActiveMemberWatcher extends SimulationControlStarter {
  private totalAttrSubscribers = new Set<OnChangeTotalAttr>();
  private bonusesSubscribers = new Set<OnChangeBonuses>();
  private activeMemberCode: number;

  constructor(party: SimulationMember[], target: SimulationTarget) {
    super(party, target);

    // just for initialization
    this.activeMemberCode = this.partyData[0].code;
  }

  get activeMember() {
    return this.member[this.activeMemberCode];
  }

  changeActiveMember = (code: number) => {
    this.activeMemberCode = code;

    setTimeout(() => {
      this.notifyTotalAttrSubscribers();
      this.notifyBonusesSubscribers();
    }, 0);
  };

  notifyTotalAttrSubscribers = () => {
    const totalAttr = this.activeMember.totalAttr;

    this.totalAttrSubscribers.forEach((callback) => callback(totalAttr));
  };

  notifyBonusesSubscribers = () => {
    const attrBonus = this.activeMember.attrBonus;
    const attkBonus = this.activeMember.attkBonus;

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
  };

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
  };
}
