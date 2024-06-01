import { calculateMember } from "@Backend";

import type { RootState } from "@Store/store";
import { AttributeTable, GenshinImage } from "@Src/components";
import { $AppCharacter, $AppWeapon } from "@Src/services";
import { useSelector } from "@Store/hooks";

const selectActiveMember = (state: RootState) => {
  const { active, simulationsById } = state.simulator;

  if (active.simulationId) {
    const { members, target } = simulationsById[active.simulationId];

    return {
      member: members[0],
      partyData: $AppCharacter.getPartyData(members),
      target,
    };
  }
  return null;
};

export function MemberDetail() {
  const data = useSelector(selectActiveMember);
  if (!data) return null;
  const { member, partyData } = data;

  const appWeapon = $AppWeapon.get(member.weapon.code)!;

  const { totalAttr } = calculateMember({
    member,
    appChar: $AppCharacter.get(member.name),
    appWeapon,
    partyData,
    elmtModCtrls: member.elmtModCtrls,
    target: data.target,
  });

  return (
    <div>
      <h3>{member.name}</h3>
      <p>
        Level: {member.level} - C{member.cons}
      </p>
      <GenshinImage src={appWeapon.icon} />
      <AttributeTable attributes={totalAttr} />
    </div>
  );
}
