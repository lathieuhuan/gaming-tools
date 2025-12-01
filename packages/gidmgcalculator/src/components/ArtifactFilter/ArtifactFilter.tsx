import { useState } from "react";
import { FaCaretRight, FaEraser } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { Button, clsx, Modal, useScreenWatcher, useValues, type ClassValue } from "rond";

import type { ArtifactType, IArtifactBasic } from "@/types";
import type { ArtifactFilterCondition } from "./types";

import { useArtifactSetFilter, useArtifactStatFilter } from "./_hooks";

// Component
import { ArtifactTypeSelect } from "@/components/ArtifactTypeSelect";
import { FilterTemplate } from "@/components/FilterTemplate";
import { ArtifactSetFilter } from "./ArtifactSetFilter";
import { ArtifactStatFilter } from "./ArtifactStatFilter";

export type ArtifactFilterProps<T extends IArtifactBasic = IArtifactBasic> = {
  forcedType?: ArtifactType;
  artifacts: T[];
  initialFilter: ArtifactFilterCondition;
  onConfirm: (filterCondition: ArtifactFilterCondition) => void;
  onClose: () => void;
};

/** Only used on Modals */
export const ArtifactFilter = <T extends IArtifactBasic = IArtifactBasic>({
  forcedType,
  artifacts,
  initialFilter,
  onConfirm,
  onClose,
}: ArtifactFilterProps<T>) => {
  const screenWatcher = useScreenWatcher();
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
          {position > minIndex ? (
            <FaCaretRight className="text-2xl rotate-180" />
          ) : (
            <TbRectangleVerticalFilled className="opacity-50" />
          )}
        </button>
        <p style={{ width: 100 }}>{title}</p>
        <button
          type="button"
          className="w-6 h-6 flex-center md:hidden"
          disabled={position >= 2}
          onClick={() => setActiveIndex((prev) => prev + 1)}
        >
          {position < 2 ? (
            <FaCaretRight className="text-2xl" />
          ) : (
            <TbRectangleVerticalFilled className="opacity-50" />
          )}
        </button>
      </div>
    );
  };

  const {
    values: artifactTypes,
    toggle: toggleArtifactType,
    update: updateArtifactTypes,
  } = useValues({
    initial: initialFilter.types,
    multiple: true,
  });

  const {
    statsFilter,
    hasDuplicates: hasDuplicatedStats,
    changeMainStat,
    changeSubStat,
    clearFilter: clearStatFilter,
  } = useArtifactStatFilter(initialFilter.stats);

  const {
    setOptions,
    toggleSet,
    clearFilter: clearSetFilter,
  } = useArtifactSetFilter(artifacts, initialFilter.codes, {
    artifactType: forcedType,
  });

  const handleConfirm = () => {
    const filteredCodes = setOptions.reduce((codes: number[], setOption) => {
      if (setOption.chosen) {
        codes.push(setOption.code);
      }
      return codes;
    }, []);

    onConfirm({
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
    <div className="h-full flex flex-col">
      <div className={clsx("grow overflow-hidden", !isSmallScreen && "xm:px-2 flex space-x-4")}>
        {!forcedType ? (
          isSmallScreen ? (
            <FilterTemplate
              className={wrapperCls(activeIndex !== 0)}
              title={renderTitle("Filter by Type", 0)}
              clearAllDisabled={!artifactTypes.length}
              onClearAll={() => updateArtifactTypes([])}
            >
              <ArtifactTypeSelect
                size="large"
                className="justify-center py-4 hide-scrollbar"
                values={artifactTypes}
                onSelect={toggleArtifactType}
              />
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

              <ArtifactTypeSelect
                size="large"
                className="py-2 flex-col hide-scrollbar"
                values={artifactTypes}
                onSelect={toggleArtifactType}
              />
            </div>
          )
        ) : null}

        {!forcedType && <div className="h-full w-px bg-dark-line hidden md:block" />}

        <div className={clsx(wrapperCls(activeIndex !== 1), "shrink-0", !isSmallScreen && "w-56")}>
          <ArtifactStatFilter
            filter={statsFilter}
            title={renderTitle("Filter by Stat", 1)}
            artifactType={forcedType}
            hasDuplicates={hasDuplicatedStats}
            onMainStatChange={changeMainStat}
            onSubStatChange={changeSubStat}
            onClearAll={clearStatFilter}
          />
        </div>

        <div className="h-full w-px bg-dark-line hidden md:block" />

        <div className={clsx([wrapperCls(activeIndex !== 2), "grow custom-scrollbar"])}>
          <ArtifactSetFilter
            title={renderTitle("Filter by Set", 2)}
            setsWrapCls="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-3 xm:grid-cols-5 lg:grid-cols-8"
            setOptions={setOptions}
            onSetClick={toggleSet}
            onClearAll={clearSetFilter}
          />
        </div>
      </div>

      <Modal.Actions
        disabledConfirm={hasDuplicatedStats}
        onCancel={onClose}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
