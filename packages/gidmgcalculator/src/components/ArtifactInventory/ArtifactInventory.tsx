import { useRef, useState } from "react";
import {
  EntitySelectTemplate,
  type EntitySelectTemplateProps,
  FancyBackSvg,
  Modal,
  useElementSize,
} from "rond";

import type { ArtifactType } from "@/types";
import { type ArtifactGear, Artifact } from "@/models/base";

import { useArtifactSetData } from "@/hooks";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import { selectDbArtifacts } from "@Store/userdb-slice";

// Conponent
import { ArtifactCard } from "../ArtifactCard";
import { ArtifactFilter, ArtifactFilterProps, useArtifactFilter } from "../ArtifactFilter";
import { InventoryRack, InventoryRackProps } from "../InventoryRack";
import { OwnerLabel } from "../OwnerLabel";

export type ArtifactInventoryProps = Pick<ArtifactFilterProps<Artifact>, "forcedType"> &
  Pick<EntitySelectTemplateProps, "hasMultipleMode"> & {
    /** Default 'flower' */
    initialType?: ArtifactType;
    currentAtfGear?: ArtifactGear;
    owner?: string | null;
    buttonText: string;
    onClickButton: (chosen: Artifact, isMultiSelect: boolean) => void;
    onClose: () => void;
  };

const ArtifactInventoryCore = ({
  forcedType,
  hasMultipleMode,
  initialType = "flower",
  currentAtfGear,
  owner,
  buttonText,
  onClickButton,
  onClose,
}: ArtifactInventoryProps) => {
  const [ref, { height }] = useElementSize<HTMLDivElement>();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [showingCurrent, setShowingCurrent] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact>();
  const setData = useArtifactSetData();

  const artifacts = useStoreSnapshot((state) => {
    const userArtifacts = selectDbArtifacts(state);

    if (forcedType) {
      const results: Artifact[] = [];

      for (const artifact of userArtifacts) {
        if (artifact.type === forcedType) {
          results.push(new Artifact(artifact, setData.get(artifact.code)));
        }
      }

      return results;
    }

    return userArtifacts.map((artifact) => new Artifact(artifact, setData.get(artifact.code)));
  });

  const { filteredArtifacts, filter, setFilter } = useArtifactFilter(artifacts, {
    types: [forcedType || initialType],
  });

  const currentPiece = selectedArtifact?.type
    ? currentAtfGear?.pieces[selectedArtifact.type]
    : undefined;

  const onChangeItem: InventoryRackProps<Artifact>["onChangeItem"] = (item) => {
    if (!item) {
      setSelectedArtifact(undefined);
      return;
    }

    if (item.userData.ID !== selectedArtifact?.ID) {
      setSelectedArtifact(item.userData);
    }

    if (bodyRef.current) {
      bodyRef.current.scrollLeft = 9999;
    }
  };

  const chosenIsCurrent = selectedArtifact && selectedArtifact.owner === owner;

  return (
    <EntitySelectTemplate
      title={<p className="text-base sm:text-xl leading-7">Artifact Inventory</p>}
      hasFilter
      hasMultipleMode={hasMultipleMode}
      filterWrapWidth="100%"
      renderFilter={(setFilterOn) => {
        return (
          <div className="h-full p-4 bg-dark-1">
            <ArtifactFilter
              forcedType={forcedType}
              artifacts={artifacts}
              initialFilter={filter}
              onConfirm={setFilter}
              onClose={() => setFilterOn(false)}
            />
          </div>
        );
      }}
      onClose={onClose}
    >
      {({ isMultiSelect }) => {
        return (
          <div ref={bodyRef} className="h-full flex custom-scrollbar gap-2 scroll-smooth">
            <InventoryRack
              data={filteredArtifacts}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              emptyText="No artifacts found"
              chosenID={selectedArtifact?.ID}
              onChangeItem={onChangeItem}
            />

            <div className="h-full flex flex-col relative">
              <div ref={ref} className="grow">
                <ArtifactCard
                  wrapperCls="w-72 h-full"
                  artifact={selectedArtifact}
                  withActions={!!selectedArtifact}
                  actions={[
                    {
                      icon: <FancyBackSvg />,
                      className: "sm:hidden",
                      onClick: () => {
                        if (bodyRef.current) bodyRef.current.scrollLeft = 0;
                      },
                    },
                    {
                      children: "Compare",
                      variant: showingCurrent ? "active" : "default",
                      className: chosenIsCurrent && "hidden",
                      disabled: !currentAtfGear,
                      onClick: () => setShowingCurrent(!showingCurrent),
                    },
                    {
                      children: buttonText,
                      variant: "primary",
                      className: chosenIsCurrent && "hidden",
                      onClick: (_, artifact) => {
                        onClickButton(artifact, isMultiSelect);
                        if (!isMultiSelect) onClose();
                      },
                    },
                  ]}
                />
              </div>

              {currentAtfGear ? (
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
                  <div className="w-64 pr-2 pb-2 h-full flex flex-col bg-dark-1 rounded-l-lg">
                    <ArtifactCard mutable={false} artifact={currentPiece} />

                    <p className="mt-4 text-center text-heading">Current equipment</p>
                  </div>
                </div>
              ) : null}

              <OwnerLabel className="mt-3" item={selectedArtifact} />
            </div>
          </div>
        );
      }}
    </EntitySelectTemplate>
  );
};

export const ArtifactInventory = Modal.coreWrap(ArtifactInventoryCore, { preset: "large" });
