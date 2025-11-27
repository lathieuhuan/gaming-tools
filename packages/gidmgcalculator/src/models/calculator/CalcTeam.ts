import type { ICalcTeam, ITeamMember } from "@/types";
import type { MainCharacter } from "./MainCharacter";

import { Team } from "@/models/base";

type UpdateData = {
  main?: MainCharacter;
  teammates?: ITeamMember[];
};

export class CalcTeam extends Team implements ICalcTeam {
  constructor(private main: MainCharacter, private teammates: ITeamMember[] = []) {
    super([main, ...teammates]);
  }

  update(data: UpdateData) {
    const { main = this.main, teammates = this.teammates } = data;

    return new CalcTeam(main, teammates);
  }

  updateTeammates(teammates: ITeamMember[]) {
    this.teammates = teammates;
    this.updateMembers([this.main, ...teammates]);
  }
}
