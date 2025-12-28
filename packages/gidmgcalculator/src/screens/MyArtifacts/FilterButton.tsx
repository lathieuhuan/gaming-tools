import { useState } from "react";
import { Modal } from "rond";

import type { IArtifactBasic } from "@/types";

import { ArtifactFilter, ArtifactFilterCondition, DEFAULT_ARTIFACT_FILTER } from "@/components";
import { ComplexFilterButton } from "../_components/ComplexFilterButton";

type FilterButtonProps = {
  artifacts: IArtifactBasic[];
  filter: ArtifactFilterCondition;
  onChange?: (filter: ArtifactFilterCondition) => void;
};

export function FilterButton({ artifacts, filter, onChange }: FilterButtonProps) {
  const [open, setOpen] = useState(false);

  const isFiltered = Boolean(
    filter.types.length ||
      filter.codes.length ||
      filter.stats.main !== "All" ||
      filter.stats.subs.some((s) => s !== "All")
  );

  const closeModal = () => setOpen(false);

  const handleConfirmFilter = (newFilter: ArtifactFilterCondition) => {
    onChange?.(newFilter);
  };

  const handleRemoveFilter = () => {
    onChange?.(DEFAULT_ARTIFACT_FILTER);
  };

  return (
    <>
      <ComplexFilterButton
        active={isFiltered}
        onClick={() => setOpen(true)}
        onClear={handleRemoveFilter}
      />

      <Modal
        active={open}
        preset="large"
        title="Artifact Filter"
        bodyCls="grow hide-scrollbar"
        onClose={closeModal}
      >
        <ArtifactFilter
          artifacts={artifacts}
          initialFilter={filter}
          onConfirm={handleConfirmFilter}
          onClose={closeModal}
        />
      </Modal>
    </>
  );
}
