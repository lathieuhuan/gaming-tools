import type { calculateSetup } from "@/calculation-new/calculator";
import type { CalcCharacter } from "@/models/base";
import type { CalcTeammate } from "@/models/calculator";
import type { UserCharacter, UserTeammate } from "@/models/userdb";
import type { IDbComplexSetup, IDbSetup, ISetup } from "@/types";
import type { ISetupManager } from "@Store/calculator/types";
import type { MySetupsModalType } from "@Store/ui-slice";

export type OpenModalFn = (type: MySetupsModalType) => () => void;

// TODO remove
export type CalculationResult = ReturnType<typeof calculateSetup>;

export type SetupOverviewInfo = {
  setup: ISetupManager & {
    main: UserCharacter;
    teammates: UserTeammate[];
  };
  dbSetup: IDbSetup;
  complexSetup?: IDbComplexSetup;
};

export type IUserSetup = ISetup<CalcCharacter, CalcTeammate>;
