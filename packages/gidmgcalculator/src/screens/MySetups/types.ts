import type { calculateSetup } from "@/calculation-new/calculator";
import type { UserCharacter, UserTeammate } from "@/models/userdb";
import type { IDbComplexSetup, IDbSetup } from "@/types";
import type { ISetupManager } from "@Store/calculator/types";
import type { MySetupsModalType } from "@Store/ui-slice";

export type OpenModalFn = (type: MySetupsModalType) => () => void;

export type CalculationResult = ReturnType<typeof calculateSetup>;

export type SetupOverviewInfo = {
  setup: ISetupManager & {
    main: UserCharacter;
    teammates: UserTeammate[];
  };
  dbSetup: IDbSetup;
  complexSetup?: IDbComplexSetup;
};
