import { useIconSelect, type IconSelectConfig, type IconSelectInitialValues } from "rond";
import { WeaponType } from "@Backend";
import { getImgSrc } from "@Src/utils";

const WEAPON_TYPE_ICONS: Array<{ value: WeaponType; icon: string }> = [
  { value: "bow", icon: getImgSrc("9/97/Weapon-class-bow-icon") },
  { value: "catalyst", icon: getImgSrc("0/02/Weapon-class-catalyst-icon") },
  { value: "claymore", icon: getImgSrc("5/51/Weapon-class-claymore-icon") },
  { value: "polearm", icon: getImgSrc("9/91/Weapon-class-polearm-icon") },
  { value: "sword", icon: getImgSrc("9/95/Weapon-class-sword-icon") },
];

export function useWeaponTypeSelect(
  initialValues?: IconSelectInitialValues<WeaponType>,
  config?: Omit<IconSelectConfig<WeaponType>, "selectedCls">
) {
  const mergedConfig: IconSelectConfig<WeaponType> = {
    ...config,
    selectedCls: "shadow-3px-3px shadow-active-color",
  };
  const { selectedIcons, updateSelectedIcons, renderIconSelect } = useIconSelect(
    WEAPON_TYPE_ICONS,
    initialValues,
    mergedConfig
  );

  return {
    weaponTypes: selectedIcons,
    updateWeaponTypes: updateSelectedIcons,
    renderWeaponTypeSelect: renderIconSelect,
  };
}
