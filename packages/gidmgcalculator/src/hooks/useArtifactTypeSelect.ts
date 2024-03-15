import { useIconSelect, type IconSelectConfig, type IconSelectInitialValues } from "rond";
import type { ArtifactType } from "@Src/types";

const ARTIFACT_TYPE_ICONS: Array<{ value: ArtifactType; icon: string }> = [
  { value: "flower", icon: "2/2d/Icon_Flower_of_Life" },
  { value: "plume", icon: "8/8b/Icon_Plume_of_Death" },
  { value: "sands", icon: "9/9f/Icon_Sands_of_Eon" },
  { value: "goblet", icon: "3/37/Icon_Goblet_of_Eonothem" },
  { value: "circlet", icon: "6/64/Icon_Circlet_of_Logos" },
];

export const useArtifactTypeSelect = (
  initialValues?: IconSelectInitialValues<ArtifactType>,
  config?: Omit<IconSelectConfig<ArtifactType>, "iconCls" | "selectedCls">
) => {
  const finalConfig: IconSelectConfig<ArtifactType> = {
    ...config,
    iconCls: "p-1",
    selectedCls: "bg-green-200",
  };
  const { selectedIcons, updateSelectedIcons, renderIconSelect } = useIconSelect(
    ARTIFACT_TYPE_ICONS,
    initialValues,
    finalConfig
  );

  return {
    artifactTypes: selectedIcons,
    updateArtifactTypes: updateSelectedIcons,
    renderArtifactTypeSelect: renderIconSelect,
  };
};
