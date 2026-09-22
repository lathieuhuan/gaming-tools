import { useRef, useState } from "react";
import { EntitySelectTemplate, type EntitySelectTemplateProps, FancyBackSvg, Modal } from "rond";

import type { Artifact, ArtifactGear } from "@/models";
import type { ArtifactType, RawArtifact } from "@/types";

import { useStoreSnapshot } from "@/lib/dynamic-store";
import { createArtifact } from "@/logic/entity.logic";
import { selectDbArtifacts } from "@Store/userdbSlice";

// Conponent
import { ArtifactFilter, ArtifactFilterProps, useArtifactFilter } from "../ArtifactFilter";
import { InventoryRack, InventoryRackProps } from "../InventoryRack";
import { SelectArtifactView } from "./SelectArtifactView";

export type ArtifactInventoryProps = Pick<ArtifactFilterProps<Artifact>, "forcedType"> &
  Pick<EntitySelectTemplateProps, "hasMultipleMode"> & {
    /** Default 'flower' */
    initialType?: ArtifactType;
    currentAtfGear?: ArtifactGear;
    owner?: number | null;
    buttonText: string;
    onClickButton: (selectedArtifact: Artifact, isMultiSelect: boolean) => void;
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
  const bodyRef = useRef<HTMLDivElement>(null);

  const [selectedArtifact, setSelectedArtifact] = useState<Artifact>();

  const artifacts = useStoreSnapshot((state) => {
    const dbArtifacts = selectDbArtifacts(state);

    return forcedType
      ? dbArtifacts.filter((artifact) => artifact.type === forcedType)
      : dbArtifacts;
  });

  const { filteredArtifacts, filter, setFilter } = useArtifactFilter(artifacts, {
    types: [forcedType || initialType],
  });

  const onChangeItem: InventoryRackProps<RawArtifact>["onChangeItem"] = (item) => {
    if (!item) {
      setSelectedArtifact(undefined);
      return;
    }

    setSelectedArtifact(createArtifact(item.userData, item.data));

    if (bodyRef.current) {
      bodyRef.current.scrollLeft = 9999;
    }
  };

  const isCurrentSelected = selectedArtifact?.owner && selectedArtifact.owner === owner;

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
              activeId={selectedArtifact?.ID}
              onChangeItem={onChangeItem}
            />

            <SelectArtifactView
              artifact={selectedArtifact}
              currentAtfGear={currentAtfGear}
              actions={(showingCurrent, setShowingCurrent) => [
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
                  className: isCurrentSelected && "hidden",
                  disabled: !currentAtfGear,
                  onClick: () => setShowingCurrent(!showingCurrent),
                },
                {
                  children: buttonText,
                  variant: "primary",
                  className: isCurrentSelected && "hidden",
                  onClick: (_, artifact) => {
                    onClickButton(artifact, isMultiSelect);
                    if (!isMultiSelect) onClose();
                  },
                },
              ]}
            />
          </div>
        );
      }}
    </EntitySelectTemplate>
  );
};

export const ArtifactInventory = Modal.coreWrap(ArtifactInventoryCore, { preset: "large" });
