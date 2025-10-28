import { AppCharacter, Level } from "@/calculation/types";
import { ArtifactC } from "./Artifact";
import { WeaponC } from "./Weapon";
import { ArtifactSetBonus, GeneralCalc } from "@/calculation/utils";
import { TotalAttributeControl } from "./TotalAttributeControl";

export interface ICharacter {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;
}

export type ICharacterArtifacts = (ArtifactC | null)[];

export interface ICharacterGear {
  weapon: WeaponC;
  artifacts?: ICharacterArtifacts;
}

export class CharacterC implements ICharacter, ICharacterGear {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;

  weapon: WeaponC;
  artifacts: ICharacterArtifacts = [null, null, null, null, null];

  isOnfield = false;
  setBonuses: ArtifactSetBonus[] = [];

  totalAttrCtrl = new TotalAttributeControl();

  constructor(info: ICharacter & ICharacterGear, public data: AppCharacter) {
    this.name = info.name;
    this.level = info.level;
    this.NAs = info.NAs;
    this.ES = info.ES;
    this.EB = info.EB;
    this.cons = info.cons;
    this.enhanced = info.enhanced;
    this.weapon = info.weapon;

    if (info.artifacts) {
      this.updateArtifacts(info.artifacts);
    }

    this.totalAttrCtrl.construct(this);
  }

  updateArtifacts(artifacts: ICharacterArtifacts) {
    this.artifacts = artifacts;
    this.setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  }

  getStats() {
    //
  }
}
