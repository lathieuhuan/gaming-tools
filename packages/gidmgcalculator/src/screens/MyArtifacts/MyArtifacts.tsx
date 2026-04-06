import { useMemo, useState } from "react";
import { Array_ } from "ron-utils";
import { useScreenWatcher, useValues, WarehouseLayout } from "rond";

import type { Artifact } from "@/models";
import type { ArtifactType } from "@/types";

import { createArtifact } from "@/logic/entity.logic";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectDbArtifacts, sortDbArtifacts } from "@Store/userdbSlice";

// Component
import {
  ArtifactFilterCondition,
  ArtifactTypeSelect,
  InventoryRack,
  useArtifactFilter,
} from "@/components";
import { UserItemSortButton } from "../components/UserItemSortButton";
import { WarehouseWrapper } from "../components/WarehouseWrapper";
import { ActiveArtifactView } from "./ActiveArtifactView";
import { AddButton } from "./AddButton";
import { FilterButton } from "./FilterButton";

function MyArtifacts() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const dbArtifacts = useSelector(selectDbArtifacts);

  const [activeId, setActiveId] = useState<number>();

  const { filteredArtifacts, filter, setFilter } = useArtifactFilter(dbArtifacts);

  const {
    values: artifactTypes,
    toggle: toggleArtifactType,
    update: updateArtifactTypes,
  } = useValues<ArtifactType>({
    multiple: true,
    onChange: (selectedTypes) => {
      setFilter((prev) => ({
        ...prev,
        types: selectedTypes,
      }));
    },
  });

  const activeArtifact = useMemo(() => {
    const data = Array_.findById(filteredArtifacts, activeId);
    return data && createArtifact(data);
  }, [filteredArtifacts, activeId]);

  const handleRemoveArtifact = (artifact: Artifact) => {
    const removedIndex = Array_.indexById(filteredArtifacts, artifact.ID);

    if (removedIndex !== -1) {
      let newActiveId: number | undefined = undefined;

      if (filteredArtifacts.length > 1) {
        const move = removedIndex === filteredArtifacts.length - 1 ? -1 : 1;

        newActiveId = filteredArtifacts[removedIndex + move]?.ID;
      }

      setActiveId(newActiveId);
    }
  };

  const handleFilterChange = (newFilter: ArtifactFilterCondition) => {
    setFilter(newFilter);
    updateArtifactTypes(newFilter.types);
  };

  const actions = (
    <div className="flex items-center space-x-4">
      <AddButton currentArtifactsCount={dbArtifacts.length} />

      <UserItemSortButton onSelectSort={(sort) => dispatch(sortDbArtifacts(sort))} />

      {screenWatcher.isFromSize("md") && (
        <ArtifactTypeSelect values={artifactTypes} onSelect={toggleArtifactType} />
      )}

      <FilterButton artifacts={dbArtifacts} filter={filter} onChange={handleFilterChange} />
    </div>
  );

  return (
    <WarehouseLayout className="h-full" actions={actions}>
      <InventoryRack
        data={filteredArtifacts}
        emptyText="No artifacts found"
        itemCls="max-w-1/3 basis-1/3 xm:max-w-1/4 xm:basis-1/4 lg:max-w-1/6 lg:basis-1/6 xl:max-w-1/8 xl:basis-1/8"
        pageSize={screenWatcher.isFromSize("xl") ? 80 : 60}
        activeId={activeId}
        onChangeItem={(artifact) => setActiveId(artifact?.userData.ID)}
      />
      <ActiveArtifactView artifact={activeArtifact} onRemoveArtifact={handleRemoveArtifact} />
    </WarehouseLayout>
  );
}

export function MyArtifactsWrapper() {
  return (
    <WarehouseWrapper>
      <MyArtifacts />
    </WarehouseWrapper>
  );
}
