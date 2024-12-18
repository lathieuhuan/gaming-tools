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

/**
 * This class is for managing all simulation activities
 */
export class SimulationControlCenter extends SimulationChunksControl {
  private readonly timeOn: boolean;
  private readonly target: SimulationTarget;
  protected readonly partyData: SimulationPartyData = [];
  protected readonly memberCtrls: Record<number, MemberControl> = {};

  private appWeapons: Record<number, AppWeapon> = {};
  // private appArtifacts: Record<number, AppArtifact> = {};

  private partyBonusesCtrl: PartyBonusControl;
  private onfieldMember: MemberControl;
  private activeMember: MemberControl;
  private activeMemberWatcher: ActiveMemberWatcher;

  constructor(simulation: Simulation) {
    super();

    this.timeOn = simulation.timeOn;
    this.partyData = simulation.members.map((member) => $AppCharacter.get(member.name));
    this.target = simulation.target;

    this.partyBonusesCtrl = new PartyBonusControl(this.partyData);

    const appArtifacts: Record<number, AppArtifact> = {};

    for (let i = 0; i < this.partyData.length; i++) {
      const member = simulation.members[i];
      const memberData = this.partyData[i];
      const weaponCode = member.weapon.code;

      if (!this.appWeapons[weaponCode]) {
        this.appWeapons[weaponCode] = $AppWeapon.get(weaponCode)!;
      }

      const setBonuses = GeneralCalc.getArtifactSetBonuses(member.artifacts);

      for (const setBonus of setBonuses) {
        if (!appArtifacts[setBonus.code]) {
          appArtifacts[setBonus.code] = $AppArtifact.getSet(setBonus.code)!;
        }
      }

      this.memberCtrls[memberData.code] = new MemberControl(
        member,
        this.partyData[i],
        this.appWeapons[weaponCode],
        appArtifacts,
        setBonuses,
        this.partyData,
        this.partyBonusesCtrl
      );
    }

    this.onfieldMember = this.memberCtrls[this.partyData[0].code];
    this.activeMember = this.memberCtrls[this.partyData[0].code];
    this.activeMemberWatcher = new ActiveMemberWatcher(this.activeMember);
  }

  genManager = () => {
    const members: Record<number, Pick<MemberControl, "info" | "data" | "weaponData" | "setBonuses">> = {};

    this.forEachMember((control) => {
      members[control.data.code] = {
        info: control.info,
        data: control.data,
        weaponData: control.weaponData,
        setBonuses: control.setBonuses,
      };
    });

    return {
      timeOn: this.timeOn,
      partyData: this.partyData,
      members,
      target: this.target,
      subscribeChunks: this.subscribeChunks,
      subscribeTotalAttr: this.activeMemberWatcher.subscribeTotalAttr,
      subscribeBonuses: this.activeMemberWatcher.subscribeBonuses,
    };
  };

  genActiveMember = (memberCode: number) => {
    this.activeMember = this.memberCtrls[memberCode];
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
      configTalentHitEvent,
    };
  };

  private applyPartyBonuses = () => {
    this.forEachMember((member) => member.applyBonuses());
  };

  protected forEachMember = (cb: (member: MemberControl) => void) => {
    for (const data of this.partyData) {
      cb(this.memberCtrls[data.code]);
    }
  };

  protected switchOnfield = (memberCode: number) => {
    this.onfieldMember.switch("out");
    this.onfieldMember = this.memberCtrls[memberCode];
    this.onfieldMember.switch("in");

    if (this.onfieldMember === this.activeMember) {
      setTimeout(() => {
        this.activeMemberWatcher.notifySubscribers();
      }, 0);
    }
  };

  protected resetBonuses = () => {
    this.partyBonusesCtrl.reset();
    this.forEachMember((member) => member.resetBonuses());
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

            this.partyBonusesCtrl.updateCommonAttkBonuses({
              id: "geo-live-reso",
              description,
              value: 15,
              toType: "all",
              toKey: "pct_",
            });
            break;
          case "dendro_strong":
            description = "Dendro Resonance (30)";

            this.partyBonusesCtrl.updateCommonAttrBonuses({
              id: "dendro-live-reso-strong",
              description,
              value: 30,
              toStat: "em",
              isStable: true,
            });
            break;
          case "dendro_weak":
            description = "Dendro Resonance (20)";

            this.partyBonusesCtrl.updateCommonAttrBonuses({
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
    const performer = this.memberCtrls[event.performerCode];
    const { affect, attrBonuses, attkBonuses, performers, source } = performer.modify(
      event.modifier,
      this.memberCtrls[event.performerCode].weaponData
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
          this.partyBonusesCtrl.updateCommonAttrBonuses(attrBonuses);
          this.partyBonusesCtrl.updateCommonAttkBonuses(attkBonuses);

          this.applyPartyBonuses();
          this.activeMemberWatcher.notifySubscribers();
          break;
        }
        case "ACTIVE_UNIT": {
          this.partyBonusesCtrl.updateOnfieldAttrBonuses(attrBonuses);
          this.partyBonusesCtrl.updateOnfieldAttkBonuses(attkBonuses);

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
    const performer = this.memberCtrls[event.performerCode];
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
