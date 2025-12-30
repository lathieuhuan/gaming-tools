import { IconSelect, IconSelectProps } from "rond";

import type { WeaponType } from "@/types";
import { getImgSrc } from "@/utils/getImgSrc";

const OPTIONS: IconSelectProps<WeaponType>["options"] = [
  { title: "Bow", value: "bow", icon: getImgSrc("9/97/Weapon-class-bow-icon") },
  { title: "Catalyst", value: "catalyst", icon: getImgSrc("0/02/Weapon-class-catalyst-icon") },
  { title: "Claymore", value: "claymore", icon: getImgSrc("5/51/Weapon-class-claymore-icon") },
  { title: "Polearm", value: "polearm", icon: getImgSrc("9/91/Weapon-class-polearm-icon") },
  { title: "Sword", value: "sword", icon: getImgSrc("9/95/Weapon-class-sword-icon") },
];

type WeaponTypeSelectProps = Omit<IconSelectProps<WeaponType>, "selectedCls" | "options">;

export const WeaponTypeSelect = (props: WeaponTypeSelectProps) => {
  return (
    <IconSelect {...props} selectedCls="shadow-hightlight-2 shadow-active" options={OPTIONS} />
  );
};
