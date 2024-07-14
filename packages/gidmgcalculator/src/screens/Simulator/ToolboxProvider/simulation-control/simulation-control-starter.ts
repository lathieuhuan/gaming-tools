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
  readonly partyData: SimulationPartyData = [];
  readonly target: SimulationTarget;
  readonly member: Record<number, MemberControl> = {};

  protected attrBonuses: SimulationAttributeBonus[] = [];
  protected attkBonuses: SimulationAttackBonus[] = [];

  protected appWeapons: Record<number, AppWeapon> = {};

  constructor(party: SimulationMember[], target: SimulationTarget) {
    this.partyData = party.map((member) => $AppCharacter.get(member.name));
    this.target = target;

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

    // Resonance
    const { pyro = 0, hydro = 0 } = GeneralCalc.countElements(this.partyData);

    if (pyro >= 2) {
      this.attrBonuses.push({
        id: "pyro-resonance",
        value: 25,
        isStable: true,
        toStat: "atk_",
        type: "ATTRIBUTE",
        description: "Pyro Resonance",
      });
    }
    if (hydro >= 2) {
      this.attrBonuses.push({
        id: "hydro-resonance",
        value: 25,
        isStable: true,
        toStat: "hp_",
        type: "ATTRIBUTE",
        description: "Hydro Resonance",
      });
    }
  }

  getAppWeaponOfMember = (code: number) => {
    return this.appWeapons[this.member[code].info.weapon.code];
  };
}
