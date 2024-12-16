import { AppArtifact, GeneralCalc, AttackReaction, AppWeapon } from "@Backend";
import type { HitEvent, ModifyEvent, Simulation, SimulationPartyData, SimulationTarget, SystemEvent } from "@Src/types";
import type {
  ProcessedHitEvent,
  ProcessedEntityModifyEvent,
  ProcessedSystemModifyEvent,
} from "./simulation-control.types";

import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
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
  readonly member: Record<number, MemberControl> = {};
  readonly target: SimulationTarget;

  private appWeapons: Record<number, AppWeapon> = {};
  private appArtifacts: Record<number, AppArtifact> = {};

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

      const setBonuses = GeneralCalc.getArtifactSetBonuses(member.artifacts);

      for (const setBonus of setBonuses) {
        if (!this.appArtifacts[setBonus.code]) {
          this.appArtifacts[setBonus.code] = $AppArtifact.getSet(setBonus.code)!;
        }
      }

      this.member[memberData.code] = new MemberControl(
        member,
        this.partyData[i],
        this.appWeapons[weaponCode],
        this.appArtifacts,
        setBonuses,
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

  private toAllMembers = (cb: (member: MemberControl) => void) => {
    for (const { code } of this.partyData) {
      cb(this.member[code]);
    }
  };

  private applyPartyBonuses = () => {
    this.toAllMembers((member) => member.applyBonuses());
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

  protected resetBonuses = () => {
    this.partyBonus.reset();
    this.toAllMembers((member) => member.resetBonuses());
    this.applyPartyBonuses();
  };

  protected systemModify = (event: SystemEvent): ProcessedSystemModifyEvent => {
    switch (event.modifier.type) {
      case "RESONANCE": {
        const { element } = event.modifier;
        let description: string;

        switch (element) {
          case "geo":
            description = "Geo Resonance / Shielded";

            this.partyBonus.updateCommonAttkBonuses({
              id: "geo-live-reso",
              description,
              value: 15,
              toType: "all",
              toKey: "pct_",
            });
            break;
          case "dendro_strong":
            description = "Dendro Resonance (30)";

            this.partyBonus.updateCommonAttrBonuses({
              id: "dendro-live-reso-strong",
              description,
              value: 30,
              toStat: "em",
              isStable: true,
            });
            break;
          case "dendro_weak":
            description = "Dendro Resonance (20)";

            this.partyBonus.updateCommonAttrBonuses({
              id: "dendro-live-reso-weak",
              description,
              value: 20,
              toStat: "em",
              isStable: true,
            });
            break;
        }

        this.applyPartyBonuses();
        this.activeMemberWatcher.notifySubscribers();

        return {
          ...event,
          performers: [
            {
              type: "SYSTEM",
            },
          ],
          duration: 0,
          description,
        };
      }
    }
  };

  protected entityModify = (event: ModifyEvent): ProcessedEntityModifyEvent => {
    const { duration = 0 } = event;
    const performer = this.member[event.performerCode];
    const { affect, attrBonuses, attkBonuses, performers, source } = performer.modify(
      event.modifier,
      this.getAppWeaponOfMember(event.performerCode)
    );

    if (affect) {
      switch (affect) {
        case "SELF": {
          performer.updateAttrBonuses(attrBonuses);
          performer.updateAttkBonuses(attkBonuses);

          performer.applyBonuses();

          if (performer === this.activeMember) {
            this.activeMemberWatcher.notifySubscribers();
          }
          break;
        }
        case "PARTY": {
          this.partyBonus.updateCommonAttrBonuses(attrBonuses);
          this.partyBonus.updateCommonAttkBonuses(attkBonuses);

          this.applyPartyBonuses();
          this.activeMemberWatcher.notifySubscribers();
          break;
        }
        case "ACTIVE_UNIT": {
          this.partyBonus.updateOnfieldAttrBonuses(attrBonuses);
          this.partyBonus.updateOnfieldAttkBonuses(attkBonuses);

          this.onfieldMember.applyBonuses();

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
        performers,
        duration,
        description: source,
      };
    }

    const error = "Cannot find the modifier.";

    return {
      ...event,
      performers: [],
      duration,
      description: `[${error}]`,
      error,
    };
  };

  protected hit = (event: HitEvent): ProcessedHitEvent => {
    const { duration = 0 } = event;
    const performer = this.member[event.performerCode];
    const result = performer?.hit(event, this.partyData, this.target);
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
      performers: [
        {
          type: "CHARACTER",
          title: performer?.data?.name,
          icon: performer?.data?.icon,
        },
      ],
      duration,
      damage,
      reaction,
      description,
    };
  };
}
