import { IconSelect, IconSelectProps } from "rond";

import type { ArtifactType } from "@/types";
import { Artifact } from "@/models/base";
import { getImgSrc } from "@/utils/getImgSrc";

const OPTIONS = Artifact.allIcons((icon) => {
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
