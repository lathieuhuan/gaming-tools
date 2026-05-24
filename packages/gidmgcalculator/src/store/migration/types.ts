import { ModifierCtrlState, DbComplexSetup, DbSetup } from "@/types";
import { UserdbState } from "@Store/userdbSlice";

type UserSetupV0 = Omit<DbSetup, "artBuffCtrls"> & {
  artBuffCtrls: ModifierCtrlState[];
};

export type UserDatabaseV0 = Omit<UserdbState, "userSetups"> & {
  userSetups: (UserSetupV0 | DbComplexSetup)[];
};
