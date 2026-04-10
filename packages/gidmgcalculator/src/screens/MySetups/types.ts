import type { Character, Teammate } from "@/models";
import type { BasicSetupType, IDbComplexSetup, IDbSetup } from "@/types";

export type SetupOverviewInfo = {
  setup: {
    ID: number;
    type: BasicSetupType;
    name: string;
    main: Character;
    teammates: Teammate[];
  };
  dbSetup: IDbSetup;
  complexSetup?: IDbComplexSetup;
};
