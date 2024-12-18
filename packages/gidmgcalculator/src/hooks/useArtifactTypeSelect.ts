import { useIconSelect, type IconSelectConfig, type IconSelectInitialValues } from "rond";
import { ArtifactType } from "@Backend";
import {  getImgSrc } from "@Src/utils";
import Entity_ from "@Src/utils/entity-utils";

const options = Entity_.allArtifactIcons((icon) => {
  return {
    value: icon.value,
    icon: getImgSrc(icon.icon),
  };
});

export function useArtifactTypeSelect(
  initialValues?: IconSelectInitialValues<ArtifactType>,
  config?: Omit<IconSelectConfig<ArtifactType>, "iconCls" | "selectedCls">
) {
  const finalConfig: IconSelectConfig<ArtifactType> = {
    ...config,
    iconCls: "p-1",
    selectedCls: "bg-active-color",
  };
  const { selectedIcons, updateSelectedIcons, renderIconSelect } = useIconSelect(options, initialValues, finalConfig);

  return {
    artifactTypes: selectedIcons,
    updateArtifactTypes: updateSelectedIcons,
    renderArtifactTypeSelect: renderIconSelect,
  };
}
