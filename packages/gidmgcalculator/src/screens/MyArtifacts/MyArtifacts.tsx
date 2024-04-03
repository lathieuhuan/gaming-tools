import { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { clsx, message, useScreenWatcher, ButtonGroup, Modal, WarehouseLayout } from "rond";

import type { UserArtifact } from "@Src/types";
import { MAX_USER_ARTIFACTS } from "@Src/constants";
import { useArtifactTypeSelect } from "@Src/hooks";
import { findById, indexById } from "@Src/utils";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { selectUserArtifacts, addUserArtifact, sortArtifacts } from "@Store/userdb-slice";

// Component
import { InventoryRack, ArtifactForge, ArtifactFilter, ArtifactFilterState } from "@Src/components";
import { ChosenArtifactView } from "./ChosenArtifactView";

type ModalType = "ADD_ARTIFACT" | "FITLER" | "";

export default function MyArtifacts() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const userArts = useSelector(selectUserArtifacts);

  const [chosenId, setChosenId] = useState<number>();
  const [modalType, setModalType] = useState<ModalType>("");
  const [filter, setFilter] = useState<ArtifactFilterState>(ArtifactFilter.DEFAULT_FILTER);

  const { updateArtifactTypes, renderArtifactTypeSelect } = useArtifactTypeSelect(null, {
    multiple: true,
    onChange: (selectedTypes) => {
      setFilter((prev) => ({
        ...prev,
        types: selectedTypes,
      }));
    },
  });

  const filteredArtifacts = useMemo(() => ArtifactFilter.filterArtifacts(userArts, filter), [userArts, filter]);
  const chosenArtifact = useMemo(() => findById(userArts, chosenId), [filteredArtifacts, chosenId]);

  const closeModal = () => setModalType("");

  const isMaxArtifactsReached = () => {
    if (userArts.length >= MAX_USER_ARTIFACTS) {
      message.error("Number of stored artifacts has reached its limit.");
      return true;
    }
  };

  const onClickAddArtifact = () => {
    if (!isMaxArtifactsReached()) {
      setModalType("ADD_ARTIFACT");
    }
  };

  const onClickSortArtifact = () => {
    dispatch(sortArtifacts());
  };

  const onRemoveArtifact = (artifact: UserArtifact) => {
    const removedIndex = indexById(filteredArtifacts, artifact.ID);

    if (removedIndex !== -1) {
      if (filteredArtifacts.length > 1) {
        const move = removedIndex === filteredArtifacts.length - 1 ? -1 : 1;

        setChosenId(filteredArtifacts[removedIndex + move]?.ID);
      } else {
        setChosenId(undefined);
      }
    }
  };

  const isFiltered =
    filter.types.length ||
    filter.codes.length ||
    filter.stats.main !== "All" ||
    filter.stats.subs.some((s) => s !== "All");

  const actions = (
    <div className="flex items-center space-x-4">
      <ButtonGroup
        buttons={[
          { children: "Add", onClick: onClickAddArtifact },
          { children: "Sort", onClick: onClickSortArtifact },
        ]}
      />

      {screenWatcher.isFromSize("md") ? renderArtifactTypeSelect() : null}

      <div className="flex cursor-pointer">
        <button
          className={clsx(
            "pl-4 py-1 text-black glow-on-hover",
            isFiltered ? "pr-2 bg-active-color rounded-l-2xl" : "pr-4 bg-light-default rounded-2xl"
          )}
          onClick={() => setModalType("FITLER")}
        >
          <p className="font-bold">Filter</p>
        </button>

        {isFiltered && (
          <div
            className="pl-2 pr-3 rounded-r-2xl text-black bg-light-default flex-center glow-on-hover"
            onClick={() => {
              const { DEFAULT_FILTER } = ArtifactFilter;
              setFilter(DEFAULT_FILTER);
              updateArtifactTypes(DEFAULT_FILTER.types);
            }}
          >
            <FaTimes />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <WarehouseLayout className="h-full" actions={actions}>
      <InventoryRack
        data={filteredArtifacts}
        emptyText="No artifacts found"
        itemCls="max-w-1/3 basis-1/3 xm:max-w-1/4 xm:basis-1/4 lg:max-w-1/6 lg:basis-1/6 xl:max-w-1/8 xl:basis-1/8"
        chosenID={chosenId}
        onChangeItem={(artifact) => setChosenId(artifact?.ID)}
      />

      <ChosenArtifactView artifact={chosenArtifact} onRemoveArtifact={onRemoveArtifact} />

      <Modal
        active={modalType === "FITLER"}
        preset="large"
        title="Artifact Filter"
        bodyCls="grow hide-scrollbar"
        onClose={closeModal}
      >
        <ArtifactFilter
          artifacts={userArts}
          initialFilter={filter}
          onDone={(newFilter) => {
            setFilter(newFilter);
            updateArtifactTypes(newFilter.types);
          }}
          onClose={closeModal}
        />
      </Modal>

      <ArtifactForge
        active={modalType === "ADD_ARTIFACT"}
        hasMultipleMode
        hasConfigStep
        onForgeArtifact={(artifact) => {
          if (isMaxArtifactsReached()) return;

          const newUserArtifact: UserArtifact = {
            ...artifact,
            ID: Date.now(),
            owner: null,
          };

          dispatch(addUserArtifact(newUserArtifact));
          setChosenId(newUserArtifact.ID);
        }}
        onClose={closeModal}
      />
    </WarehouseLayout>
  );
}
