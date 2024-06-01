import { getMemberStats } from "@Backend";

import { AttributeTable } from "@Src/components";
import { $AppCharacter, $AppWeapon } from "@Src/services";
import { pickProps } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

const selectActiveMember = (state: RootState) => {
  const { active, simulationsById } = state.simulator;

  if (active.simulationId) {
    const { members } = simulationsById[active.simulationId];

    return {
      member: members[0],
      partyData: $AppCharacter.getPartyData(members),
    };
  }
  return null;
};

export function MemberDetail() {
  const data = useSelector(selectActiveMember);
  if (!data) return null;
  const { member, partyData } = data;

  const { totalAttr } = getMemberStats({
    char: pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB"]),
    appChar: $AppCharacter.get(member.name),
    weapon: member.weapon,
    appWeapon: $AppWeapon.get(member.weapon.code)!,
    artifacts: member.artifacts,
    partyData,
    selfBuffCtrls: member.buffCtrls,
    elmtModCtrls: member.elmtModCtrls,
  });

  return (
    <div>
      <AttributeTable attributes={totalAttr} />
    </div>
  );
}
