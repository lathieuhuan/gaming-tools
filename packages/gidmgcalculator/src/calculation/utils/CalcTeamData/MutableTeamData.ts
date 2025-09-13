import type { AppCharactersByName, Teammate } from "@/types";
import { CalcTeamData } from "./CalcTeamData";

export class MutableTeamData extends CalcTeamData {
  //

  updateActiveMember = (name: string, data: AppCharactersByName) => {
    this._activeMemberN = name;
    this.data = {
      ...this.data,
      ...data,
    };
    this.countElements();
    this.countExtraTalentLv();
  };

  updateTeammates = (teammates: Teammate[] = [], data: AppCharactersByName) => {
    this._teammates = teammates;
    this._teammateNs = teammates.map((teammate) => teammate.name);
    this.data = {
      ...this.data,
      ...data,
    };
    this.countElements();
    this.countExtraTalentLv();
  };
}
