import type { CalcCharacter } from "@/models/base";
import type { CalcTeammate } from "@/models/calculator";
import type { BasicSetupType, IDbComplexSetup, IDbSetup } from "@/types";

export type SetupOverviewInfo = {
  setup: {
    ID: number;
    type: BasicSetupType;
    name: string;
    main: CalcCharacter;
    teammates: CalcTeammate[];
  };
  dbSetup: IDbSetup;
  complexSetup?: IDbComplexSetup;
};
