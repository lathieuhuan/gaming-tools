import { useIconSelect, type IconSelectConfig, type IconSelectInitialValues } from "rond";
import { ArtifactType } from "@Backend";
import { Artifact_, getImgSrc } from "@Src/utils";

const options = Artifact_.ARTIFACT_TYPE_ICONS.map((item) => ({ value: item.value, icon: getImgSrc(item.icon) }));

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
