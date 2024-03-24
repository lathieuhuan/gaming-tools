import { useIconSelect, type IconSelectConfig, type IconSelectInitialValues } from "rond";
import type { ArtifactType } from "@Src/types";
import { Artifact_ } from "@Src/utils";

export function useArtifactTypeSelect(
  initialValues?: IconSelectInitialValues<ArtifactType>,
  config?: Omit<IconSelectConfig<ArtifactType>, "iconCls" | "selectedCls">
) {
  const finalConfig: IconSelectConfig<ArtifactType> = {
    ...config,
    iconCls: "p-1",
    selectedCls: "bg-active-color",
  };
  const { selectedIcons, updateSelectedIcons, renderIconSelect } = useIconSelect(
    Artifact_.ARTIFACT_TYPE_ICONS,
    initialValues,
    finalConfig
  );

  return {
    artifactTypes: selectedIcons,
    updateArtifactTypes: updateSelectedIcons,
    renderArtifactTypeSelect: renderIconSelect,
  };
}
