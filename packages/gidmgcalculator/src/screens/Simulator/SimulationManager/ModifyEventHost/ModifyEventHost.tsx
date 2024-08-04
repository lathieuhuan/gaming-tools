import { AppWeapon, CharacterBuff, EntityCalc, GeneralCalc } from "@Backend";
import type { InputsByMember } from "./ModifyEventHost.types";

import { Modifier_ } from "@Src/utils";
import { useActiveMember, useActiveSimulation, SimulationManager } from "@Simulator/ToolboxProvider";

// Component
import { OnFieldMemberWatch } from "../components";
import { EventListCharacterBuff } from "./EventListCharacterBuff";
import { EventListWeaponBuff } from "./EventListWeaponBuff";

export function ModifyEventHost(props: { className?: string }) {
  const simulation = useActiveSimulation();

  if (!simulation) {
    return null;
  }

  const characterBuffsByMember: ModifyEventHostForActiveMemberProps["characterBuffsByMember"] = {};
  const characterBuffAllInputsByMember: InputsByMember = {};
  const appWeaponByMember: ModifyEventHostForActiveMemberProps["appWeaponByMember"] = {};
  const weaponBuffAllInputsByMember: InputsByMember = {};
  const artifactBuffAllInputsByMember: InputsByMember = {};

  for (const data of simulation.partyData) {
    const memberCode = data.code;
    const info = simulation.getMemberInfo(memberCode);

    // Character buff
    const characterBuffs = simulation
      .getMemberData(memberCode)
      .buffs?.filter((buff) => EntityCalc.isGrantedEffect(buff, info));

    if (characterBuffs) {
      characterBuffsByMember[memberCode] = characterBuffs;

      characterBuffAllInputsByMember[memberCode] = characterBuffs.map(
        (buff) => Modifier_.createModCtrl(buff, true).inputs ?? []
      );
    }

    // Weapon buff
    const appWeapon = simulation.getAppWeaponOfMember(memberCode);

    appWeaponByMember[memberCode] = appWeapon;

    if (appWeapon.buffs) {
      weaponBuffAllInputsByMember[memberCode] = appWeapon.buffs.map(
        (buff) => Modifier_.createModCtrl(buff, true).inputs ?? []
      );
    }

    // Artifact buff
    const setBonuses = GeneralCalc.getArtifactSetBonuses(info.artifacts);
  }

  return (
    <ModifyEventHostForActiveMember
      className={props.className}
      simulation={simulation}
      characterBuffsByMember={characterBuffsByMember}
      initalCharacterBuffAllInputsByMember={characterBuffAllInputsByMember}
      appWeaponByMember={appWeaponByMember}
      initalWeaponBuffAllInputsByMember={weaponBuffAllInputsByMember}
    />
  );
}

interface ModifyEventHostForActiveMemberProps {
  className?: string;
  simulation: SimulationManager;
  characterBuffsByMember: Record<number, CharacterBuff[]>;
  initalCharacterBuffAllInputsByMember: InputsByMember;
  appWeaponByMember: Record<number, AppWeapon>;
  initalWeaponBuffAllInputsByMember: InputsByMember;
}
function ModifyEventHostForActiveMember(props: ModifyEventHostForActiveMemberProps) {
  const { simulation } = props;
  const activeMember = useActiveMember();

  if (!activeMember) {
    return null;
  }
  const activeMemberCode = activeMember.data.code;

  return (
    <OnFieldMemberWatch className={props.className} activeMemberCode={activeMemberCode}>
      <div className="h-full hide-scrollbar space-y-3">
        <EventListCharacterBuff
          simulation={simulation}
          member={activeMember}
          buffs={props.characterBuffsByMember[activeMemberCode]}
          initalInputsByMember={props.initalCharacterBuffAllInputsByMember}
        />
        <EventListWeaponBuff
          member={activeMember}
          appWeapon={props.appWeaponByMember[activeMemberCode]}
          refi={simulation.getMemberInfo(activeMemberCode).weapon.refi}
          initalInputsByMember={props.initalWeaponBuffAllInputsByMember}
        />
      </div>
    </OnFieldMemberWatch>
  );
}
