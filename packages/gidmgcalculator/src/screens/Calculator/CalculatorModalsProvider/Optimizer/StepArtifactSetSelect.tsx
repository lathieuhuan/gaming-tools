import { useEffect } from "react";
import { useArtifactSetFilter, type ArtifactFilterSet } from "@Src/components/ArtifactFilter";
import { useStoreSnapshot } from "@Src/features";

interface StepArtifactSetSelectProps {
  id: string;
  initialValue?: Set<number>;
  onChangeValid?: (valid: boolean) => void;
  onSubmit: (sets: ArtifactFilterSet[]) => void;
}
export function StepArtifactSetSelect(props: StepArtifactSetSelectProps) {
  const data = useStoreSnapshot((state) => {
    const artifacts = state.userdb.userArts;
    return {
      artifacts,
      codes: props.initialValue ? [...props.initialValue] : artifacts.map((artifact) => artifact.code),
    };
  });

  const { setOptions, setFilterProps, ArtifactSetFilter } = useArtifactSetFilter(data.artifacts, data.codes);

  useEffect(() => {
    props.onChangeValid?.(setOptions.some((option) => option.chosen));
  }, [setOptions]);

  return (
    <form
      id={props.id}
      className="h-full"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(setOptions.filter((option) => option.chosen));
      }}
    >
      <ArtifactSetFilter {...setFilterProps} title="Only use Artifact Sets" setsWrapCls="pr-2 grid grid-cols-4" />
    </form>
  );
}
