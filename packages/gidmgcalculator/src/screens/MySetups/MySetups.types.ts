import { type MySetupsModalType } from "@Store/ui-slice";

export type OpenModalFn = (type: MySetupsModalType) => () => void;
