import { useRef, useState } from "react";
import { FaEraser, FaSquare } from "react-icons/fa";
import { FaCaretRight } from "react-icons/fa";
import { Button, Modal, useScreenWatcher, clsx, type ClassValue } from "rond";

import type { ArtifactType, CalcArtifact } from "@Src/types";
import type { ArtifactFilterState } from "./ArtifactFilter.types";

import { useArtifactTypeSelect } from "@Src/hooks";
import { useArtifactSetFilter, useArtifactStatFilter, DEFAULT_STAT_FILTER } from "./hooks";
import { FilterTemplate } from "../FilterTemplate";
import { filterArtifacts } from "./filter-artifacts";

export interface ArtifactFilterProps {
  forcedType?: ArtifactType;
  artifacts: CalcArtifact[];
  initialFilter: ArtifactFilterState;
  onDone: (filterCondition: ArtifactFilterState) => void;
  onClose: () => void;
}
/** Only used on Modals */
const ArtifactFilter = ({ forcedType, artifacts, initialFilter, onDone, onClose }: ArtifactFilterProps) => {
  const screenWatcher = useScreenWatcher();
  const wrapElmt = useRef<HTMLDivElement>(null);
  const minIndex = forcedType ? 1 : 0;

  const [activeIndex, setActiveIndex] = useState(minIndex);

  const renderTitle = (title: string, position: number) => {
    return (
      <div className="flex items-centers gap-2">
        <button
          type="button"
          className="w-6 h-6 flex-center md:hidden"
          disabled={position <= minIndex}
          onClick={() => setActiveIndex((prev) => prev - 1)}
        >
          {position > minIndex ? <FaCaretRight className="text-2xl rotate-180" /> : <FaSquare className="opacity-50" />}
        </button>
        <p style={{ width: 100 }}>{title}</p>
        <button
          type="button"
          className="w-6 h-6 flex-center md:hidden"
          disabled={position >= 2}
          onClick={() => setActiveIndex((prev) => prev + 1)}
        >
          {position < 2 ? <FaCaretRight className="text-2xl" /> : <FaSquare className="opacity-50" />}
        </button>
      </div>
    );
  };

  const { artifactTypes, updateArtifactTypes, renderArtifactTypeSelect } = useArtifactTypeSelect(initialFilter.types, {
    size: "large",
    multiple: true,
  });
  const { statsFilter, hasDuplicates, renderArtifactStatFilter } = useArtifactStatFilter(initialFilter.stats, {
    title: renderTitle("Filter by Stat", 1),
    artifactType: forcedType,
  });
  const { setOptions, renderArtifactSetFilter } = useArtifactSetFilter(artifacts, initialFilter.codes, {
    title: renderTitle("Filter by Set", 2),
    artifactType: forcedType,
  });

  const onConfirmFilter = () => {
    const filteredCodes = setOptions.reduce((codes: number[], setOption) => {
      if (setOption.chosen) {
        codes.push(setOption.code);
      }
      return codes;
    }, []);

    onDone({
      stats: statsFilter,
      codes: filteredCodes,
      types: artifactTypes,
    });
    onClose();
  };

  const isSmallScreen = !screenWatcher.isFromSize("md");

  const wrapperCls = (isHidden: boolean): ClassValue => {
    return isSmallScreen && ["h-full", isHidden && "hidden"];
  };

  return (
    <div ref={wrapElmt} className="h-full flex flex-col">
      <div className={clsx("grow overflow-hidden", !isSmallScreen && "xm:px-2 flex space-x-4")}>
        {!forcedType ? (
          isSmallScreen ? (
            <FilterTemplate
              className={wrapperCls(activeIndex !== 0)}
              title={renderTitle("Filter by Type", 0)}
              disabledClearAll={!artifactTypes.length}
              onClickClearAll={() => updateArtifactTypes([])}
            >
              {renderArtifactTypeSelect("justify-center py-4 hide-scrollbar")}
            </FilterTemplate>
          ) : (
            <div className="flex flex-col items-center shrink-0 space-y-4">
              <p>Type</p>

              <Button
                size="custom"
                className="p-1"
                icon={<FaEraser className="text-lg" />}
                disabled={!artifactTypes.length}
                onClick={() => updateArtifactTypes([])}
              />

              {renderArtifactTypeSelect("py-2 flex-col hide-scrollbar")}
            </div>
          )
        ) : null}

        {!forcedType && <div className="h-full w-px bg-surface-border hidden md:block" />}

        <div className={clsx(wrapperCls(activeIndex !== 1), "shrink-0", !isSmallScreen && "w-56")}>
          {renderArtifactStatFilter()}
        </div>

        <div className="h-full w-px bg-surface-border hidden md:block" />

        <div className={clsx([wrapperCls(activeIndex !== 2), "grow custom-scrollbar"])}>
          {renderArtifactSetFilter(
            null,
            "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-3 xm:grid-cols-5 lg:grid-cols-8"
          )}
        </div>
      </div>

      <Modal.Actions disabledConfirm={hasDuplicates} onCancel={onClose} onConfirm={onConfirmFilter} />
    </div>
  );
};

const DEFAULT_FILTER: ArtifactFilterState = {
  stats: DEFAULT_STAT_FILTER,
  codes: [],
  types: [],
};

ArtifactFilter.DEFAULT_FILTER = DEFAULT_FILTER;
ArtifactFilter.filterArtifacts = filterArtifacts;

export { ArtifactFilter };
