import { AttackPattern, CalcItem, LevelableTalentType, NORMAL_ATTACKS } from "@Backend";

import type { HitEvent, ModifyEvent, PartyData, SimulationMember, SimulationTarget } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { MemberControl } from "./member-control";

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
    if (!buff) return;
    const receiver = this.member[event.receiver];

    performer.buffApplier.applyCharacterBuff({
      buff,
      description: ``,
      inputs: event.modifier.inputs,
      applyAttrBonus: (bonus) => {
        const add = bonus.stable ? receiver.totalAttr.addStable : receiver.totalAttr.addUnstable;

        // #to-do: record this bonus to show in bonus displayer

        add(bonus.stat, bonus.value, bonus.description);
      },
      applyAttkBonus: (bonus) => {
        receiver.attkBonus.push({
          toType: bonus.module,
          toKey: bonus.path,
          value: bonus.value,
          trigger: {
            character: performer.info.name,
            modifier: buff.src,
          },
        });
      },
    });
  };

  hit = (event: HitEvent) => {
    const performer = this.member[event.performer];

    if (performer) {
      const { calcList } = performer.data;
      let hitInfo:
        | {
            talent: LevelableTalentType;
            pattern: AttackPattern;
            item: CalcItem;
          }
        | undefined = undefined;

      switch (event.talent) {
        case "NAs":
          for (const type of NORMAL_ATTACKS) {
            const found = calcList[type].find((calcItem) => calcItem.name === event.calcItemId);
            if (found) {
              hitInfo = {
                item: found,
                talent: "NAs",
                pattern: type,
              };
              break;
            }
          }
          break;
        default:
          const item = calcList[event.talent].find((calcItem) => calcItem.name === event.calcItemId);

          if (item) {
            hitInfo = {
              item,
              talent: event.talent,
              pattern: event.talent,
            };
          }
      }
      if (hitInfo) {
        const result = performer.hit(hitInfo.talent, hitInfo.pattern, hitInfo.item, {}, this.partyData, this.target);
        console.log("hit");
        console.log(result.damage);
        return;
      }
      console.log("not hit");
    }
  };
}
