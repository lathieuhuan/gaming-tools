import type { Character, TeammateCalc } from "@/models";
import type { BasicSetupType, IDbComplexSetup, IDbSetup } from "@/types";

export type SetupOverviewInfo = {
  setup: {
    ID: number;
    type: BasicSetupType;
    name: string;
    main: Character;
    teammates: TeammateCalc[];
  };
  dbSetup: IDbSetup;
  complexSetup?: IDbComplexSetup;
};
