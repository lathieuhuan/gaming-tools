import { isValidTeamElmt } from "@/calculation/condition-checking";
import { ElementCount, TalentType } from "@/calculation/types";
import Array_ from "@/utils/Array";
import TypeCounter from "@/utils/TypeCounter";
import { CalcSetupData, CalcSetupDataConstructorParams } from "./CalcSetupData";
import { CharacterC } from "./Character";

export class CalcSetup extends CalcSetupData {
  trueTeammates: CharacterC[] = [];
  elmtCount: ElementCount = new TypeCounter();
  moonsignLv = 0;
  witchRiteLv = 0;
  extraTalentLv = new TypeCounter<TalentType>();

  constructor(params: CalcSetupDataConstructorParams) {
    super(params);
    this.trueTeammates = Array_.truthify(this.party);
    this.countElements();
    this.countMoonsignLv();
    this.countWitchRiteLv();
    this.countExtraTalentLv();
  }

  hasMember = (name: string) => {
    return this.char.name === name || this.party.some((teammate) => teammate?.name === name);
  };

  countElements = () => {
    this.elmtCount.clear();
    this.elmtCount.add(this.char.data.vision);

    this.trueTeammates.forEach((teammate) => {
      this.elmtCount.add(teammate.data.vision);
    });
  };

  countExtraTalentLv = () => {
    this.extraTalentLv.clear();
    const { extraTalentLv } = this;

    if (this.hasMember("Tartaglia")) {
      extraTalentLv.add("NAs");
    }
    if (this.hasMember("Skirk")) {
      const isValid = isValidTeamElmt(this.elmtCount, {
        teamOnlyElmts: ["hydro", "cryo"],
        teamEachElmtCount: {
          hydro: 1,
          cryo: 1,
        },
      });

      if (isValid) {
        extraTalentLv.add("ES");
      }
    }
  };

  countMoonsignLv = () => {
    let moonsignLv = this.char.data.faction?.includes("moonsign") ? 1 : 0;

    this.trueTeammates.forEach((teammate) => {
      if (teammate.data.faction?.includes("moonsign")) {
        moonsignLv++;
      }
    });

    this.moonsignLv = Math.min(moonsignLv, 2);
  };

  countWitchRiteLv = () => {
    const witchRiteLv = this.trueTeammates.reduce(
      (total, teammate) => total + (teammate.enhanced ? 1 : 0),
      this.char.enhanced ? 1 : 0
    );

    this.witchRiteLv = Math.min(witchRiteLv, 2);
  };
}
