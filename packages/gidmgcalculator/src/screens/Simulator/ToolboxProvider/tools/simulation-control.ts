import type { HitEvent, ModifyEvent, PartyData, SimulationEvent, SimulationMember, SimulationTarget } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

export class SimulationControl {
  member: Record<number, MemberControl>;
  partyData: PartyData;
  target: SimulationTarget;
  events: SimulationEvent[] = [];

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

  processEvents = (events: SimulationEvent[]) => {
    let isMissmatched = false;
    let checkedIndex = 0;

    while (checkedIndex < this.events.length) {
      const event = events[checkedIndex];

      if (!event || this.events[checkedIndex].id !== event.id) {
        isMissmatched = true;
        break;
      }
      checkedIndex++;
    }

    if (isMissmatched) {
      this.events = [];

      for (const code in this.member) {
        this.member[code].reset(this.partyData);
      }
      return events.forEach(this.processNewEvent);
    }

    while (checkedIndex < events.length) {
      this.processNewEvent(events[checkedIndex]);
      checkedIndex++;
    }
  };

  private processNewEvent = (event: SimulationEvent) => {
    switch (event.type) {
      case "MODIFY":
        this.modify(event);
        break;
      case "HIT":
        this.hit(event);
        break;
    }
    this.events.push(event);
  };

  private modify = (event: ModifyEvent) => {
    const performer = this.member[event.performer];
    const buff = performer?.data.buffs?.find((buff) => buff.index === event.modifier.id);

    if (buff) {
      this.member[event.receiver]?.applyCharacterBuff(performer.info.name, buff, event.modifier.inputs);
    }
  };

  private hit = (event: HitEvent) => {
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
