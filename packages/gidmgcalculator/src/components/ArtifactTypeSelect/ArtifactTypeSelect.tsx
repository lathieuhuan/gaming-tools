import { IconSelect, IconSelectProps } from "rond";

import { Artifact } from "@/models";
import type { ArtifactType } from "@/types";
import { GenshinImage } from "../GenshinImage";

const OPTIONS: IconSelectProps<ArtifactType>["options"] = Artifact.allIcons((icon) => {
  return {
    title: icon.type,
    value: icon.type,
    icon: <GenshinImage src={icon.src} />,
  };
});

type ArtifactTypeSelectProps = Omit<IconSelectProps<ArtifactType>, "classNames" | "options">;

export function ArtifactTypeSelect(props: ArtifactTypeSelectProps) {
  return (
    <IconSelect {...props} classNames={{ item: "p-1", selected: "bg-active" }} options={OPTIONS} />
  );
}
