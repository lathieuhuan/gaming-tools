import type { Character, Teammate } from "@/models";
import type { BasicSetupType, DbComplexSetup, DbSetup } from "@/types";

export type SetupOverviewInfo = {
  setup: {
    ID: number;
    type: BasicSetupType;
    name: string;
    main: Character;
    teammates: Teammate[];
  };
  dbSetup: DbSetup;
  complexSetup?: DbComplexSetup;
};
