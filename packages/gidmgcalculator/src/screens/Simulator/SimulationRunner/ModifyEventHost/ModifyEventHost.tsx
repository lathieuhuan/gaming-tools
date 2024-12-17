import { clsx, type ClassValue } from "rond";
import { CharacterBuff, GeneralCalc, isGrantedEffect } from "@Backend";
import type { InputsByMember } from "./ModifyEventHost.types";

import Modifier_ from "@Src/utils/modifier-utils";
import { useActiveMember, SimulationManager } from "@Simulator/ToolboxProvider";

// Component
import { EventListResonanceBuff, type EventListResonanceBuffProps } from "./EventListResonanceBuff";
import { EventListCharacterBuff } from "./EventListCharacterBuff";
import { EventListWeaponBuff } from "./EventListWeaponBuff";

interface ModifyEventHostProps {
  className?: ClassValue;
  simulation: SimulationManager;
}
export function ModifyEventHost({ className, simulation }: ModifyEventHostProps) {
  const characterBuffsByMember: ModifyEventHostForActiveMemberProps["characterBuffsByMember"] = {};
  const characterBuffAllInputsByMember: InputsByMember = {};
  const weaponBuffAllInputsByMember: InputsByMember = {};
  const artifactBuffAllInputsByMember: InputsByMember = {};

  // For Resonance
  const elmtCount = GeneralCalc.countElements(simulation.partyData);

  for (const data of simulation.partyData) {
    const memberCode = data.code;
    const member = simulation.members[memberCode];

    // Character buff
    const characterBuffs = data.buffs?.filter((buff) => isGrantedEffect(buff, member.info));

    if (characterBuffs) {
      characterBuffsByMember[memberCode] = characterBuffs;

      characterBuffAllInputsByMember[memberCode] = characterBuffs.map(
        (buff) => Modifier_.createModCtrl(buff, true).inputs ?? []
      );
    }

    // Weapon buff
    const weaponBuffs = member.weaponData.buffs;

    if (weaponBuffs) {
      weaponBuffAllInputsByMember[memberCode] = weaponBuffs.map(
        (buff) => Modifier_.createModCtrl(buff, true).inputs ?? []
      );
    }

    // Artifact buff
    const setBonuses = member.setBonuses;
  }

  return (
    <ModifyEventHostForActiveMember
      className={className}
      simulation={simulation}
      geoResonated={elmtCount.get("geo") >= 2}
      dendroResonated={elmtCount.get("dendro") >= 2}
      characterBuffsByMember={characterBuffsByMember}
      initalCharacterBuffAllInputsByMember={characterBuffAllInputsByMember}
      initalWeaponBuffAllInputsByMember={weaponBuffAllInputsByMember}
    />
  );
}

interface ModifyEventHostForActiveMemberProps extends EventListResonanceBuffProps {
  className?: ClassValue;
  simulation: SimulationManager;
  characterBuffsByMember: Record<number, CharacterBuff[]>;
  initalCharacterBuffAllInputsByMember: InputsByMember;
  initalWeaponBuffAllInputsByMember: InputsByMember;
}
function ModifyEventHostForActiveMember(props: ModifyEventHostForActiveMemberProps) {
  const { simulation, geoResonated, dendroResonated } = props;
  const activeMember = useActiveMember();

  if (!activeMember) {
    return null;
  }
  const activeMemberCode = activeMember.data.code;

  return (
    <div className={clsx("p-4", props.className)}>
      <div className="h-full hide-scrollbar space-y-3">
        <EventListResonanceBuff geoResonated={geoResonated} dendroResonated={dendroResonated} />
        <EventListCharacterBuff
          simulation={simulation}
          member={activeMember}
          buffs={props.characterBuffsByMember[activeMemberCode]}
          initalInputsByMember={props.initalCharacterBuffAllInputsByMember}
        />
        <EventListWeaponBuff
          member={activeMember}
          weaponData={simulation.members[activeMemberCode].weaponData}
          refi={simulation.members[activeMemberCode].info.weapon.refi}
          initalInputsByMember={props.initalWeaponBuffAllInputsByMember}
        />
      </div>
    </div>
  );
}
