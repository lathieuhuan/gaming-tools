import { useMemo, useState } from "react";
import { useElementSize, Modal, EntitySelectTemplate, type EntitySelectTemplateProps } from "rond";

import type { ArtifactType, CalcArtifact, UserArtifact } from "@Src/types";
import { ARTIFACT_TYPES } from "@Src/constants";
import { useStoreSnapshot } from "@Src/features";
import { selectUserArtifacts } from "@Store/userdb-slice";

// Conponent
import { ArtifactCard } from "../ArtifactCard";
import { OwnerLabel } from "../OwnerLabel";
import { ArtifactFilter, ArtifactFilterProps, ArtifactFilterState } from "../ArtifactFilter";
import { InventoryRack } from "./InventoryRack";

export interface ArtifactInventoryProps
  extends Pick<ArtifactFilterProps, "forcedType">,
    Pick<EntitySelectTemplateProps, "hasMultipleMode"> {
  /** Default to 'flower' */
  initialType?: ArtifactType;
  currentArtifacts: (CalcArtifact | null)[];
  owner?: string | null;
  buttonText: string;
  onClickButton: (chosen: UserArtifact, isMultiSelect: boolean) => void;
  onClose: () => void;
}
const ArtifactInventoryCore = ({
  forcedType,
  hasMultipleMode,
  initialType = "flower",
  currentArtifacts,
  owner,
  buttonText,
  onClickButton,
  onClose,
}: ArtifactInventoryProps) => {
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  const [showingCurrent, setShowingCurrent] = useState(false);
  const [chosenArtifact, setChosenArtifact] = useState<UserArtifact>();
  const [filter, setFilter] = useState<ArtifactFilterState>({
    ...ArtifactFilter.DEFAULT_FILTER,
    types: [forcedType || initialType],
  });

  const artifacts = useStoreSnapshot((state) => {
    const userArtifacts = selectUserArtifacts(state);
    return forcedType ? userArtifacts.filter((artifact) => artifact.type === forcedType) : userArtifacts;
  });

  const filteredArtifacts = useMemo(() => ArtifactFilter.filterArtifacts(artifacts, filter), [artifacts, filter]);
  const currentArtifact = chosenArtifact?.type
    ? currentArtifacts[ARTIFACT_TYPES.indexOf(chosenArtifact.type)]
    : undefined;

  return (
    <EntitySelectTemplate
      title={<p className="text-base sm:text-xl leading-7">Artifact Inventory</p>}
      hasFilter
      hasMultipleMode={hasMultipleMode}
      filterWrapWidth="100%"
      renderFilter={(setFilterOn) => {
        return (
          <div className="h-full p-4 bg-dark-900">
            <ArtifactFilter
              forcedType={forcedType}
              artifacts={artifacts}
              initialFilter={filter}
              onDone={setFilter}
              onClose={() => setFilterOn(false)}
            />
          </div>
        );
      }}
      onClose={onClose}
    >
      {({ isMultiSelect }) => {
        return (
          <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
            <InventoryRack
              data={filteredArtifacts}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              emptyText="No artifacts found"
              chosenID={chosenArtifact?.ID}
              onChangeItem={setChosenArtifact}
            />

            <div className="h-full flex flex-col relative">
              <div ref={ref} className="grow">
                <ArtifactCard
                  wrapperCls="w-72 h-full"
                  artifact={chosenArtifact}
                  withActions={chosenArtifact && chosenArtifact.owner !== owner}
                  actions={[
                    {
                      children: "Compare",
                      variant: showingCurrent ? "active" : "default",
                      disabled: !currentArtifact,
                      onClick: () => setShowingCurrent(!showingCurrent),
                    },
                    {
                      children: buttonText,
                      variant: "primary",
                      onClick: (_, artifact) => {
                        onClickButton(artifact, isMultiSelect);
                        if (!isMultiSelect) onClose();
                      },
                    },
                  ]}
                />
              </div>

              {currentArtifact ? (
                <div
                  className={
                    "absolute top-0 z-10 h-full hide-scrollbar transition-size duration-200 " +
                    (showingCurrent ? "w-60" : "w-0")
                  }
                  style={{
                    height,
                    right: "calc(100% - 1rem)",
                  }}
                >
                  <div className="w-64 pr-2 pb-2 h-full flex flex-col bg-dark-900 rounded-l-lg">
                    <ArtifactCard mutable={false} artifact={currentArtifact} />

                    <p className="mt-4 text-center text-orange-500">Current equipment</p>
                  </div>
                </div>
              ) : null}

              <OwnerLabel className="mt-4" item={chosenArtifact} />
            </div>
          </div>
        );
      }}
    </EntitySelectTemplate>
  );
};

export const ArtifactInventory = Modal.coreWrap(ArtifactInventoryCore, { preset: "large" });
