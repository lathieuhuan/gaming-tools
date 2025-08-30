import { useState } from "react";
import { FaEraser, FaCaretRight } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { Button, Modal, useScreenWatcher, clsx, type ClassValue } from "rond";
import { ArtifactType } from "@Calculation";

import type { CalcArtifact } from "@/types";
import type { ArtifactFilterCondition } from "@/utils/filter-artifacts";
import { useArtifactTypeSelect } from "@/hooks";
import { useArtifactSetFilter, useArtifactStatFilter } from "./hooks";
import { FilterTemplate } from "../FilterTemplate";

export interface ArtifactFilterProps {
  forcedType?: ArtifactType;
  artifacts: CalcArtifact[];
  initialFilter: ArtifactFilterCondition;
  onDone: (filterCondition: ArtifactFilterCondition) => void;
  onClose: () => void;
}
/** Only used on Modals */
export const ArtifactFilter = ({ forcedType, artifacts, initialFilter, onDone, onClose }: ArtifactFilterProps) => {
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
          {position < 2 ? <FaCaretRight className="text-2xl" /> : <TbRectangleVerticalFilled className="opacity-50" />}
        </button>
      </div>
    );
  };

  const { artifactTypes, artifactTypeSelectProps, updateArtifactTypes, ArtifactTypeSelect } = useArtifactTypeSelect(
    initialFilter.types,
    {
      multiple: true,
    }
  );
  const { statsFilter, statsFilterProps, ArtifactStatFilter } = useArtifactStatFilter(initialFilter.stats);
  const { setOptions, setFilterProps, ArtifactSetFilter } = useArtifactSetFilter(artifacts, initialFilter.codes, {
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
    <div className="h-full flex flex-col">
      <div className={clsx("grow overflow-hidden", !isSmallScreen && "xm:px-2 flex space-x-4")}>
        {!forcedType ? (
          isSmallScreen ? (
            <FilterTemplate
              className={wrapperCls(activeIndex !== 0)}
              title={renderTitle("Filter by Type", 0)}
              disabledClearAll={!artifactTypes.length}
              onClickClearAll={() => updateArtifactTypes([])}
            >
              <ArtifactTypeSelect
                {...artifactTypeSelectProps}
                size="large"
                className="justify-center py-4 hide-scrollbar"
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

              <ArtifactTypeSelect {...artifactTypeSelectProps} size="large" className="py-2 flex-col hide-scrollbar" />
            </div>
          )
        ) : null}

        {!forcedType && <div className="h-full w-px bg-surface-border hidden md:block" />}

        <div className={clsx(wrapperCls(activeIndex !== 1), "shrink-0", !isSmallScreen && "w-56")}>
          <ArtifactStatFilter
            {...statsFilterProps}
            title={renderTitle("Filter by Stat", 1)}
            artifactType={forcedType}
          />
        </div>

        <div className="h-full w-px bg-surface-border hidden md:block" />

        <div className={clsx([wrapperCls(activeIndex !== 2), "grow custom-scrollbar"])}>
          <ArtifactSetFilter
            {...setFilterProps}
            title={renderTitle("Filter by Set", 2)}
            setsWrapCls="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-3 xm:grid-cols-5 lg:grid-cols-8"
          />
        </div>
      </div>

      <Modal.Actions disabledConfirm={statsFilterProps.hasDuplicates} onCancel={onClose} onConfirm={onConfirmFilter} />
    </div>
  );
};
