import { useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import { clsx, Modal } from "rond";

import { ArtifactFilter, ArtifactFilterCondition, DEFAULT_ARTIFACT_FILTER } from "@/components";
import type { IArtifactBasic } from "@/types";

type FilterButtonProps = {
  artifacts: IArtifactBasic[];
  filter: ArtifactFilterCondition;
  onChange?: (filter: ArtifactFilterCondition) => void;
};

export function FilterButton({ artifacts, filter, onChange }: FilterButtonProps) {
  const [open, setOpen] = useState(false);

  const isFiltered =
    filter.types.length ||
    filter.codes.length ||
    filter.stats.main !== "All" ||
    filter.stats.subs.some((s) => s !== "All");

  const closeModal = () => setOpen(false);

  const handleConfirmFilter = (newFilter: ArtifactFilterCondition) => {
    onChange?.(newFilter);
  };

  const handleRemoveFilter = () => {
    onChange?.(DEFAULT_ARTIFACT_FILTER);
  };

  return (
    <>
      <div className="flex cursor-pointer">
        <button
          className={clsx(
            "pl-3 py-1.5 text-sm text-black rounded-2xl glow-on-hover flex items-center gap-1",
            isFiltered ? "pr-2 bg-active rounded-r-none" : "pr-3 bg-light-1"
          )}
          onClick={() => setOpen(true)}
        >
          <FaFilter className="shrink-0" />
          <p className="font-bold">Filter</p>
        </button>

        {isFiltered && (
          <div
            className="pl-2 pr-3 rounded-r-2xl text-black bg-light-1 flex-center glow-on-hover"
            onClick={handleRemoveFilter}
          >
            <FaTimes />
          </div>
        )}
      </div>

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
