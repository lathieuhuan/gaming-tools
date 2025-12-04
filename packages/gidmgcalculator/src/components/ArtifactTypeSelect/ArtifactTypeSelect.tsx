import { ArtifactType } from "@Calculation";
import { IconSelect, IconSelectProps } from "rond";

import Entity_ from "@/utils/Entity";
import { getImgSrc } from "@/utils/getImgSrc";

const OPTIONS = Entity_.allArtifactIcons((icon) => {
  return {
    value: icon.value,
    icon: getImgSrc(icon.icon),
  };
});

type ArtifactTypeSelectProps = Omit<
  IconSelectProps<ArtifactType>,
  "iconCls" | "selectedCls" | "options"
>;

export function ArtifactTypeSelect(props: ArtifactTypeSelectProps) {
  return <IconSelect {...props} iconCls="p-1" selectedCls="bg-active" options={OPTIONS} />;
}
