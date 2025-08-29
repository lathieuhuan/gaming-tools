import { calculateSetup } from "@Calculation";
import { UserArtifacts, UserComplexSetup, UserSetup, UserWeapon } from "@Src/types";
import { MySetupsModalType } from "@Store/ui-slice";

export type OpenModalFn = (type: MySetupsModalType) => () => void;

export type CalculationResult = ReturnType<typeof calculateSetup>;

export type SetupRenderInfo = {
  setup: UserSetup;
  weapon?: UserWeapon;
  artifacts: UserArtifacts;
  complexSetup?: UserComplexSetup;
};
