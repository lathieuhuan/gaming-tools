import { useEffect } from "react";
import { useArtifactSetFilter } from "@Src/components/ArtifactFilter/hooks";
import { useStoreSnapshot } from "@Src/features";

interface StepArtifactSetSelectProps {
  id: string;
  initialValue?: number[];
  onChangeValid?: (valid: boolean) => void;
  onSubmit: (artifactCodes: number[]) => void;
}
export function StepArtifactSetSelect(props: StepArtifactSetSelectProps) {
  const data = useStoreSnapshot((state) => {
    const artifacts = state.userdb.userArts;
    return {
      artifacts,
      codes: props.initialValue || artifacts.map((artifact) => artifact.code),
    };
  });

  const { setOptions, renderArtifactSetFilter } = useArtifactSetFilter(data.artifacts, data.codes, {
    title: "Artifact Sets to be used",
  });

  useEffect(() => {
    props.onChangeValid?.(setOptions.some((option) => option.chosen));
  }, [setOptions]);

  return (
    <form
      id={props.id}
      className="h-full"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(
          setOptions.reduce<number[]>((codes, option) => {
            return option.chosen ? codes.concat(option.code) : codes;
          }, [])
        );
      }}
    >
      {renderArtifactSetFilter(null, "pr-2 grid grid-cols-4")}
    </form>
  );
}
