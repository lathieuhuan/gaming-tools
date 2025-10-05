import { useScreenWatcher } from "../../providers";
import { MobileSelect } from "./MobileSelect";
import { Select, type SelectProps, type SelectValueType } from "./Select";

export type VersatileSelectProps<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
> = SelectProps<TValue, TData>;

export function VersatileSelect<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
>(props: VersatileSelectProps<TValue, TData>) {
  const screenWatcher = useScreenWatcher();

  return screenWatcher.isFromSize("sm") ? (
    <Select<TValue, TData> {...props} title={undefined} />
  ) : (
    <MobileSelect {...props} />
  );
}
