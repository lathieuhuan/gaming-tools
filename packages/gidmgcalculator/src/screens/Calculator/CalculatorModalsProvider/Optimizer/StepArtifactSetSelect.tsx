import { useState } from "react";
import type { Artifact } from "@Src/types";
import { useArtifactSetFilter, type ArtifactFilterSet } from "@Src/components/ArtifactFilter";

interface StepArtifactSetSelectProps {
  id: string;
  initialValue?: number[];
  artifacts: Artifact[];
  onSubmit: (sets: ArtifactFilterSet[]) => string | undefined;
}
export function StepArtifactSetSelect({ id, initialValue = [], artifacts, onSubmit }: StepArtifactSetSelectProps) {
  const [error, setError] = useState("");
  const { setOptions, setFilterProps, ArtifactSetFilter } = useArtifactSetFilter(artifacts, initialValue);

  return (
    <form
      id={id}
      className="h-full"
      onSubmit={(e) => {
        e.preventDefault();
        const submitError = onSubmit(setOptions.filter((option) => option.chosen));
        if (submitError) setError(submitError);
      }}
    >
      <ArtifactSetFilter
        {...setFilterProps}
        title="Only use Artifact Sets"
        setsWrapCls="pr-2 grid grid-cols-4"
        message={{
          type: "error",
          value: error,
        }}
      />
    </form>
  );
}
