import { GeneralCalc, type AppWeapon } from "@Backend";
import type {
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";
import { $AppCharacter, $AppWeapon } from "@Src/services";
import { MemberControl } from "./member-control";

export class SimulationControlStarter {
  partyData: SimulationPartyData = [];
  appWeapons: Record<number, AppWeapon> = {};
  target: SimulationTarget;
  member: Record<number, MemberControl> = {};

  protected teamAttrBonus: SimulationAttributeBonus[] = [];
  protected teamAttkBonus: SimulationAttackBonus[] = [];

  constructor(party: SimulationMember[], target: SimulationTarget) {
    this.partyData = party.map((member) => $AppCharacter.get(member.name));
    this.target = target;

    // Resonance
    const { pyro = 0, hydro = 0 } = GeneralCalc.countElements(this.partyData);

    if (pyro >= 2) {
      this.teamAttrBonus.push({
        id: "pyro-resonance",
        value: 25,
        isStable: true,
        toStat: "atk_",
        type: "ATTRIBUTE",
        description: "Pyro Resonance",
      });
    }
    if (hydro >= 2) {
      this.teamAttrBonus.push({
        id: "hydro-resonance",
        value: 25,
        isStable: true,
        toStat: "hp_",
        type: "ATTRIBUTE",
        description: "Hydro Resonance",
      });
    }

    for (let i = 0; i < party.length; i++) {
      const member = party[i];
      const memberData = this.partyData[i];
      const weaponCode = member.weapon.code;

      if (!this.appWeapons[weaponCode]) {
        this.appWeapons[weaponCode] = $AppWeapon.get(weaponCode)!;
      }

      this.member[memberData.code] = new MemberControl(
        member,
        this.partyData[i],
        this.appWeapons[weaponCode],
        this.partyData
      );
    }
  }
}
