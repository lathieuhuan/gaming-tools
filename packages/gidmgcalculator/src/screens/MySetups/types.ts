import type { CharacterCalc, TeammateCalc } from "@/models/calculation";
import type { BasicSetupType, IDbComplexSetup, IDbSetup } from "@/types";

export type SetupOverviewInfo = {
  setup: {
    ID: number;
    type: BasicSetupType;
    name: string;
    main: CharacterCalc;
    teammates: TeammateCalc[];
  };
  dbSetup: IDbSetup;
  complexSetup?: IDbComplexSetup;
};
