import type { IconSelectProps, IconSelectConfig, IconSelectInitialValues } from "rond";
import { useIconSelect } from "rond";
import { WeaponType } from "@Calculation";
import { getImgSrc } from "@/utils";

const WEAPON_TYPE_ICONS: Array<{ value: WeaponType; icon: string }> = [
  { value: "bow", icon: getImgSrc("9/97/Weapon-class-bow-icon") },
  { value: "catalyst", icon: getImgSrc("0/02/Weapon-class-catalyst-icon") },
  { value: "claymore", icon: getImgSrc("5/51/Weapon-class-claymore-icon") },
  { value: "polearm", icon: getImgSrc("9/91/Weapon-class-polearm-icon") },
  { value: "sword", icon: getImgSrc("9/95/Weapon-class-sword-icon") },
];

export function useWeaponTypeSelect(
  initialValues?: IconSelectInitialValues<WeaponType>,
  config?: IconSelectConfig<WeaponType>
) {
  const { selectedIcons, selectProps, updateSelectedIcons, IconSelect } = useIconSelect(
    WEAPON_TYPE_ICONS,
    initialValues,
    config
  );

  const mergeProps = {
    ...selectProps,
    selectedCls: "shadow-3px-3px shadow-active-color",
  } satisfies IconSelectProps<WeaponType>;

  return {
    weaponTypes: selectedIcons,
    weaponTypeSelectProps: mergeProps,
    updateWeaponTypes: updateSelectedIcons,
    WeaponTypeSelect: IconSelect,
  };
}
