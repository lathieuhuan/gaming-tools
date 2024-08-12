import type { AppWeapon } from "@Backend";
import type {
  AttackReaction,
  HitEvent,
  EntityModifyEvent,
  Simulation,
  SimulationPartyData,
  SimulationTarget,
  SystemModifyEvent,
} from "@Src/types";
import type {
  ProcessedHitEvent,
  ProcessedEntityModifyEvent,
  ProcessedSystemModifyEvent,
} from "./simulation-control.types";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import {
  MemberControl,
  PartyBonusControl,
  SimulationChunksControl,
  ActiveMemberWatcher,
  type ConfigTalentHitEventArgs,
  type TalentEventConfig,
} from "./tools";

export class SimulationControlCenter extends SimulationChunksControl {
  readonly timeOn: boolean;
  readonly partyData: SimulationPartyData = [];
  readonly target: SimulationTarget;
  readonly member: Record<number, MemberControl> = {};

  private appWeapons: Record<number, AppWeapon> = {};
  private partyBonus: PartyBonusControl;

  private onfieldMember: MemberControl;
  private activeMember: MemberControl;
  private activeMemberWatcher: ActiveMemberWatcher;

  constructor(simulation: Simulation) {
    super();

    const { members } = simulation;

    this.timeOn = simulation.timeOn;
    this.partyData = members.map((member) => $AppCharacter.get(member.name));
    this.target = simulation.target;

    this.partyBonus = new PartyBonusControl(this.partyData);

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
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

    this.onfieldMember = this.member[this.partyData[0].code];
    this.activeMember = this.member[this.partyData[0].code];
    this.activeMemberWatcher = new ActiveMemberWatcher(this.activeMember);
  }

  genManager = () => {
    const getMemberInfo = (code: number) => {
      return this.member[code].info;
    };

    const getMemberData = (code: number) => {
      return this.member[code].data;
    };

    return {
      timeOn: this.timeOn,
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
    this.activeMember = this.member[memberCode];
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

  private getAppWeaponOfMember = (code: number) => {
    return this.appWeapons[this.member[code].info.weapon.code];
  };

  protected switchOnfield = (memberCode: number) => {
    this.onfieldMember.switch("out");
    this.onfieldMember = this.member[memberCode];
    this.onfieldMember.switch("in");

    if (this.onfieldMember === this.activeMember) {
      setTimeout(() => {
        this.activeMemberWatcher.notifySubscribers();
      }, 0);
    }
  };

  protected systemModify = (event: SystemModifyEvent): ProcessedSystemModifyEvent => {
    switch (event.modifier.type) {
      case "RESONANCE":
        const { element, inputs = [] } = event.modifier;

        switch (element) {
          case "geo":
            this.partyBonus.updatePartyAttkBonus({
              id: "geo-reso-dmg-bonus",
              description: "Geo Resonance / Shielded",
              value: 15,
              toType: "all",
              toKey: "pct_",
            });
            break;
          case "dendro":
            break;
        }

        this.activeMemberWatcher.notifySubscribers();

        return {
          ...event,
          duration: 0,
          description: `${element.at(0)?.toUpperCase()}${element.slice(1)} Resonance`,
        };
    }
  };

  protected entityModify = (event: EntityModifyEvent): ProcessedEntityModifyEvent => {
    const { duration = 0 } = event;
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
        duration,
        description: source,
      };
    }

    const error = "Cannot find the modifier.";

    return {
      ...event,
      duration,
      description: `[${error}]`,
      error,
    };
  };

  protected hit = (event: HitEvent): ProcessedHitEvent => {
    const { duration = 0 } = event;

    switch (event.performer.type) {
      case "CHARACTER": {
        const result = this.member[event.performer.code]?.hit(event, this.partyData, this.target);
        const damage: ProcessedHitEvent["damage"] = {
          value: 0,
          element: "phys",
        };
        let description: string;
        let error: string | undefined;
        let reaction: AttackReaction = null;

        if (result) {
          damage.value = result.damage;
          damage.element = result.attElmt;
          reaction = result.reaction;
          description = result.name;

          if (result.disabled) {
            error = "This attack is disabled.";
          }
        } else {
          error = "Cannot find the attack.";
          description = `[${error}]`;
        }

        return {
          ...event,
          duration,
          damage,
          reaction,
          description,
        };
      }
    }
  };
}
