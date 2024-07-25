import type { AppWeapon, AppliedAttackBonus, AppliedAttributeBonus } from "@Backend";
import type { ModifyEvent, SimulationMember, SimulationPartyData, SimulationTarget } from "@Src/types";
import type { ProcessedModifyEvent } from "../ToolboxProvider.types";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { ConfigTalentHitEventArgs, MemberControl, TalentEventConfig } from "./member-control";
import { PartyBonusControl } from "./party-bonus-control";
import { ActiveMemberWatcher } from "./active-member-watcher";
import { SimulationChunksControl } from "./simulation-chunks-control";

export class SimulationControlCenter extends SimulationChunksControl {
  readonly partyData: SimulationPartyData = [];
  readonly target: SimulationTarget;
  readonly member: Record<number, MemberControl> = {};

  private appWeapons: Record<number, AppWeapon> = {};
  private partyBonus: PartyBonusControl;

  private activeMemberCode: number;
  private activeMemberWatcher: ActiveMemberWatcher;

  private get activeMember() {
    return this.member[this.activeMemberCode];
  }

  private get onfieldMember() {
    return this.member[this.latestChunk.ownerCode];
  }

  constructor(party: SimulationMember[], target: SimulationTarget) {
    super();

    this.partyData = party.map((member) => $AppCharacter.get(member.name));
    this.target = target;

    this.partyBonus = new PartyBonusControl(this.partyData);

    this.activeMemberCode = this.partyData[0].code;
    this.activeMemberWatcher = new ActiveMemberWatcher(this.activeMember);

    for (let i = 0; i < party.length; i++) {
      const member = party[i];
      const memberData = this.partyData[i];
      const weaponCode = member.weapon.code;

      if (!this.appWeapons[weaponCode]) {
        this.appWeapons[weaponCode] = $AppWeapon.get(weaponCode)!;
      }

      this.member[memberData.code] = new MemberControl(
        member,
        this.partyData[i],
        this.appWeapons[weaponCode],
        this.partyData,
        this.partyBonus
      );
    }
  }

  genManager = () => {
    const getMemberInfo = (code: number) => {
      return this.member[code].info;
    };

    const getMemberData = (code: number) => {
      return this.member[code].data;
    };

    return {
      partyData: this.partyData,
      target: this.target,
      getMemberInfo,
      getMemberData,
      getAppWeaponOfMember: this.getAppWeaponOfMember,
      subscribeChunks: this.subscribeChunks,
      subscribeTotalAttr: this.activeMemberWatcher.subscribeTotalAttr,
      subscribeBonuses: this.activeMemberWatcher.subscribeBonuses,
    };
  };

  genActiveMember = (memberCode: number) => {
    this.activeMemberCode = memberCode;
    this.activeMemberWatcher.changeActiveMember(this.activeMember);

    const configTalentHitEvent = (args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">): TalentEventConfig => {
      return this.activeMember?.configTalentHitEvent({
        ...args,
        partyData: this.partyData,
        target: this.target,
      });
    };

    return {
      info: this.activeMember.info,
      data: this.activeMember.data,
      tools: {
        configTalentHitEvent,
      },
    };
  };

  getAppWeaponOfMember = (code: number) => {
    return this.appWeapons[this.member[code].info.weapon.code];
  };

  private modifyMembers = (
    receivers: MemberControl[],
    attrBonuses: AppliedAttributeBonus[],
    attkBonuses: AppliedAttackBonus[]
  ) => {
    for (const bonus of attrBonuses) {
      receivers.forEach((receiver) => receiver.updateAttrBonus(bonus));
    }
    for (const bonus of attkBonuses) {
      receivers.forEach((receiver) => receiver.updateAttkBonus(bonus));
    }

    receivers.forEach((receiver) => receiver.applySimulationBonuses());

    if (receivers.includes(this.activeMember)) {
      this.activeMemberWatcher.notifySubscribers();
    }
  };

  protected modify = (event: ModifyEvent, onfieldMember: number): ProcessedModifyEvent => {
    const performer = this.member[event.performer.code];
    const { affect, attrBonuses, attkBonuses, source } = performer.modify(
      event,
      this.getAppWeaponOfMember(event.performer.code)
    );

    if (affect) {
      switch (affect) {
        case "SELF": {
          attrBonuses.forEach((bonus) => performer.updateAttrBonus(bonus));
          attkBonuses.forEach((bonus) => performer.updateAttkBonus(bonus));

          performer.applySimulationBonuses();

          if (performer === this.activeMember) {
            this.activeMemberWatcher.notifySubscribers();
          }
          break;
        }
        case "PARTY": {
          attrBonuses.forEach((bonus) => this.partyBonus.updatePartyAttrBonus(bonus));
          attkBonuses.forEach((bonus) => this.partyBonus.updatePartyAttkBonus(bonus));

          for (const { code } of this.partyData) {
            this.member[code].applySimulationBonuses();
          }

          this.activeMemberWatcher.notifySubscribers();
          break;
        }
        case "ACTIVE_UNIT": {
          attrBonuses.forEach((bonus) => this.partyBonus.updateOnfieldAttrBonus(bonus));
          attkBonuses.forEach((bonus) => this.partyBonus.updateOnfieldAttkBonus(bonus));

          this.onfieldMember.applySimulationBonuses();

          if (this.onfieldMember === this.activeMember) {
            this.activeMemberWatcher.notifySubscribers();
          }
          break;
        }
        case "TEAMMATE":
          break;
        case "SELF_TEAMMATE":
          break;
        case "ONE_UNIT":
          break;
      }

      return {
        ...event,
        description: source,
      };
    }

    const error = "Cannot find the modifier.";

    return {
      ...event,
      description: `[${error}]`,
      error,
    };
  };
}
