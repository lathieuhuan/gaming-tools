import {
  TypedUseSelectorHook,
  useDispatch as useUntypedDispatch,
  useSelector as useUntypedSelector,
} from "react-redux";
import { AppDispatch, RootState } from "./index";

export const useDispatch: () => AppDispatch = useUntypedDispatch;
export const useSelector: TypedUseSelectorHook<RootState> = useUntypedSelector;
