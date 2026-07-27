import { IconSelect, IconSelectProps } from "rond";

import { Weapon } from "@/models";
import type { WeaponType } from "@/types";
import { GenshinImage } from "../GenshinImage";

const OPTIONS: IconSelectProps<WeaponType>["options"] = Weapon.allIcons((icon) => {
  return {
    title: icon.type,
    value: icon.type,
    icon: <GenshinImage src={icon.src} />,
  };
});

type WeaponTypeSelectProps = Omit<IconSelectProps<WeaponType>, "classNames" | "options">;

export const WeaponTypeSelect = (props: WeaponTypeSelectProps) => {
  return (
    <IconSelect
      {...props}
      classNames={{ selected: "shadow-hightlight-2 shadow-active" }}
      options={OPTIONS}
    />
  );
};
