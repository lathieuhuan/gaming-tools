import type { HitEvent, ModifyEvent, PartyData, SimulationMember, SimulationTarget } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

export class SimulationControl {
  member: Record<number, MemberControl>;
  partyData: PartyData;
  target: SimulationTarget;

  constructor(party: SimulationMember[], target: SimulationTarget) {
    const memberManager: Record<number, MemberControl> = {};
    const partyData = party.map((member) => $AppCharacter.get(member.name));

    for (let i = 0; i < party.length; i++) {
      const member = party[i];
      const memberData = partyData[i];
      memberManager[memberData.code] = new MemberControl(member, partyData[i], partyData);
    }
    this.member = memberManager;
    this.partyData = partyData;
    this.target = target;
  }

  modify = (event: ModifyEvent) => {
    const performer = this.member[event.performer];
    const buff = performer?.data.buffs?.find((buff) => buff.index === event.modifier.id);

    if (buff) {
      this.member[event.receiver]?.apply(performer.info.name, buff, event.modifier.inputs);
    }
  };

  hit = (event: HitEvent) => {
    const result = this.member[event.performer]?.hit(event, this.partyData, this.target);

    if (result) {
      console.log("hit", result.damage);
      return;
    }
    console.log("not hit");
  };

  config = (memberCode: number, args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => {
    return this.member[memberCode]?.configTalentHitEvent({
      ...args,
      partyData: this.partyData,
      target: this.target,
    });
  };
}
