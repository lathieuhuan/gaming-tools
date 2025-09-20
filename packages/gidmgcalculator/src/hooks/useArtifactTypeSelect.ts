import { IconSelectProps, useIconSelect, type IconSelectConfig, type IconSelectInitialValues } from "rond";
import { ArtifactType } from "@Calculation";
import { getImgSrc } from "@/utils";
import Entity_ from "@/utils/Entity";

const options = Entity_.allArtifactIcons((icon) => {
  return {
    value: icon.value,
    icon: getImgSrc(icon.icon),
  };
});

export function useArtifactTypeSelect(
  initialValues?: IconSelectInitialValues<ArtifactType>,
  config?: IconSelectConfig<ArtifactType>
) {
  const { selectedIcons, selectProps, updateSelectedIcons, IconSelect } = useIconSelect(options, initialValues, config);

  const mergeProps = {
    ...selectProps,
    iconCls: "p-1",
    selectedCls: "bg-active-color",
  } satisfies IconSelectProps<ArtifactType>;

  return {
    artifactTypes: selectedIcons,
    artifactTypeSelectProps: mergeProps,
    updateArtifactTypes: updateSelectedIcons,
    ArtifactTypeSelect: IconSelect,
  };
}
