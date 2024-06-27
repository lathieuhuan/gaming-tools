import { CharacterBuff, EntityCalc } from "@Backend";

import { useActiveMember, useActiveSimulation } from "@Simulator/ToolboxProvider";
import { Modifier_ } from "@Src/utils";
import { InputsByMember } from "./ModifyEventHost.types";

import { EventListCharacterBuff } from "./EventListCharacterBuff";

export function ModifyEventHost(props: { className?: string }) {
  const simulation = useActiveSimulation();
  const activeMember = useActiveMember();

  if (!simulation || !activeMember) {
    return null;
  }

  const activeMemberBuffs: CharacterBuff[] = [];
  const initalInputsListByMember: InputsByMember = {};

  for (const data of simulation.partyData) {
    const buffs = simulation
      .getMemberData(data.code)
      .buffs?.filter((buff) => EntityCalc.isGrantedEffect(buff, activeMember.info));

    if (buffs) {
      initalInputsListByMember[data.code] = buffs.map((buff) => Modifier_.createModCtrl(buff, true).inputs ?? []);

      if (data.code === activeMember.data.code) {
        activeMemberBuffs.push(...buffs);
      }
    }
  }

  return (
    <div className={props.className}>
      <EventListCharacterBuff
        simulation={simulation}
        member={activeMember}
        initalInputsByMember={initalInputsListByMember}
        buffs={activeMemberBuffs}
      />
    </div>
  );
}
