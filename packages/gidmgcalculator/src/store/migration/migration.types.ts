import { ModifierCtrl, UserComplexSetup, UserSetup } from "@/types";
import { UserdbState } from "@Store/userdb-slice";

type UserSetupV0 = Omit<UserSetup, "artBuffCtrls"> & {
  artBuffCtrls: ModifierCtrl[];
};

export type UserDatabaseV0 = Omit<UserdbState, "userSetups"> & {
  userSetups: (UserSetupV0 | UserComplexSetup)[];
};
