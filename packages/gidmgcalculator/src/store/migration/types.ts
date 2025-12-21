import { IModifierCtrlBasic, IDbComplexSetup, IDbSetup } from "@/types";
import { UserdbState } from "@Store/userdb-slice";

type UserSetupV0 = Omit<IDbSetup, "artBuffCtrls"> & {
  artBuffCtrls: IModifierCtrlBasic[];
};

export type UserDatabaseV0 = Omit<UserdbState, "userSetups"> & {
  userSetups: (UserSetupV0 | IDbComplexSetup)[];
};
