import { calculateSetup } from "@Calculation";
import { UserArtifacts, UserComplexSetup, UserSetup, IUserWeapon } from "@/types";
import { MySetupsModalType } from "@Store/ui-slice";

export type OpenModalFn = (type: MySetupsModalType) => () => void;

export type CalculationResult = ReturnType<typeof calculateSetup>;

export type SetupRenderInfo = {
  setup: UserSetup;
  weapon?: IUserWeapon;
  artifacts: UserArtifacts;
  complexSetup?: UserComplexSetup;
};
