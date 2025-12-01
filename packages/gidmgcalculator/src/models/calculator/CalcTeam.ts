import type { ICalcTeam, ITeamMember } from "@/types";

import { CalcCharacter, Team } from "@/models/base";

type UpdateData<TMain extends CalcCharacter = CalcCharacter> = {
  main?: TMain;
  teammates?: ITeamMember[];
};

export class CalcTeam<TMain extends CalcCharacter = CalcCharacter>
  extends Team
  implements ICalcTeam
{
  constructor(private main: TMain, private teammates: ITeamMember[] = []) {
    super([main, ...teammates]);
  }

  update(data: UpdateData<TMain>) {
    const { main = this.main, teammates = this.teammates } = data;

    return new CalcTeam(main, teammates);
  }

  updateTeammates(teammates: ITeamMember[]) {
    this.teammates = teammates;
    this.updateMembers([this.main, ...teammates]);
  }
}
