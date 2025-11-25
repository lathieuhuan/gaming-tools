import { getImgSrc } from "@/utils/getImgSrc";
import { WeaponType } from "@Calculation";
import { IconSelect, IconSelectProps } from "rond";

const OPTIONS: Array<{ value: WeaponType; icon: string }> = [
  { value: "bow", icon: getImgSrc("9/97/Weapon-class-bow-icon") },
  { value: "catalyst", icon: getImgSrc("0/02/Weapon-class-catalyst-icon") },
  { value: "claymore", icon: getImgSrc("5/51/Weapon-class-claymore-icon") },
  { value: "polearm", icon: getImgSrc("9/91/Weapon-class-polearm-icon") },
  { value: "sword", icon: getImgSrc("9/95/Weapon-class-sword-icon") },
];

type WeaponTypeSelectProps = Omit<IconSelectProps<WeaponType>, "selectedCls" | "options">;

export const WeaponTypeSelect = (props: WeaponTypeSelectProps) => {
  return (
    <IconSelect {...props} selectedCls="shadow-hightlight-2 shadow-active" options={OPTIONS} />
  );
};
