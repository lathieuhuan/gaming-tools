import { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ButtonGroup, clsx, LoadingPlate, message, Modal, useScreenWatcher, WarehouseLayout } from "rond";

import type { UserArtifact } from "@/types";

import { MAX_USER_ARTIFACTS } from "@/constants";
import { useArtifactTypeSelect } from "@/hooks";
import { $AppArtifact } from "@/services";
import Array_ from "@/utils/array-utils";
import { ArtifactFilterCondition, DEFAULT_ARTIFACT_FILTER, filterArtifacts } from "@/utils/filter-artifacts";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import { addUserArtifact, selectUserArtifacts, sortArtifacts, updateUserArtifact } from "@Store/userdb-slice";

// Component
import { ArtifactFilter, ArtifactForge, ArtifactForgeProps, InventoryRack } from "@/components";
import { ChosenArtifactView } from "./ChosenArtifactView";

type ModalType = "ADD_ARTIFACT" | "EDIT_ARTIFACT" | "CONFIG_FILTER" | "";

function MyArtifacts() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const userArts = useSelector(selectUserArtifacts);

  const [chosenId, setChosenId] = useState<number>();
  const [modalType, setModalType] = useState<ModalType>("");
  const [filter, setFilter] = useState<ArtifactFilterCondition>(DEFAULT_ARTIFACT_FILTER);

  const { artifactTypeSelectProps, updateArtifactTypes, ArtifactTypeSelect } = useArtifactTypeSelect(null, {
    multiple: true,
    onChange: (selectedTypes) => {
      setFilter((prev) => ({
        ...prev,
        types: selectedTypes,
      }));
    },
  });

  const filteredArtifacts = useMemo(() => filterArtifacts(userArts, filter), [userArts, filter]);
  const chosenArtifact = useMemo(() => Array_.findById(filteredArtifacts, chosenId), [filteredArtifacts, chosenId]);

  const closeModal = () => setModalType("");

  const isNewArtifactAddable = () => {
    if (userArts.length < MAX_USER_ARTIFACTS) {
      return true;
    }
    message.error("Number of stored artifacts has reached its limit.");
    return false;
  };

  const onClickAddArtifact = () => {
    if (isNewArtifactAddable()) {
      setModalType("ADD_ARTIFACT");
    }
  };

  const onClickSortArtifact = () => {
    dispatch(sortArtifacts());
  };

  const onRemoveArtifact = (artifact: UserArtifact) => {
    const removedIndex = Array_.indexById(filteredArtifacts, artifact.ID);

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

      {screenWatcher.isFromSize("md") ? <ArtifactTypeSelect {...artifactTypeSelectProps} /> : null}

      <div className="flex cursor-pointer">
        <button
          className={clsx(
            "pl-3 py-1.5 text-black rounded-2xl glow-on-hover",
            isFiltered ? "pr-2 bg-active-color rounded-r-none" : "pr-3 bg-light-default"
          )}
          onClick={() => setModalType("CONFIG_FILTER")}
        >
          <p className="font-bold text-sm">Filter</p>
        </button>

        {isFiltered && (
          <div
            className="pl-2 pr-3 rounded-r-2xl text-black bg-light-default flex-center glow-on-hover"
            onClick={() => {
              setFilter(DEFAULT_ARTIFACT_FILTER);
              updateArtifactTypes(DEFAULT_ARTIFACT_FILTER.types);
            }}
          >
            <FaTimes />
          </div>
        )}
      </div>
    </div>
  );

  const dynamicForgeProps: Pick<ArtifactForgeProps, "workpiece" | "initialMaxRarity" | "hasMultipleMode"> = {};

  if (modalType === "ADD_ARTIFACT") {
    dynamicForgeProps.hasMultipleMode = true;
  }
  if (modalType === "EDIT_ARTIFACT") {
    const variants = chosenArtifact
      ? $AppArtifact.getAll().find((artifact) => artifact.code === chosenArtifact.code)?.variants
      : [];

    dynamicForgeProps.workpiece = chosenArtifact;
    dynamicForgeProps.initialMaxRarity = variants ? variants[variants.length - 1] : undefined;
    dynamicForgeProps.hasMultipleMode = false;
  }

  return (
    <WarehouseLayout className="h-full" actions={actions}>
      <InventoryRack
        data={filteredArtifacts}
        emptyText="No artifacts found"
        itemCls="max-w-1/3 basis-1/3 xm:max-w-1/4 xm:basis-1/4 lg:max-w-1/6 lg:basis-1/6 xl:max-w-1/8 xl:basis-1/8"
        pageSize={screenWatcher.isFromSize("xl") ? 80 : 60}
        chosenID={chosenId}
        onChangeItem={(artifact) => setChosenId(artifact?.ID)}
      />

      <ChosenArtifactView
        artifact={chosenArtifact}
        onRemoveArtifact={onRemoveArtifact}
        onRequestEditArtifact={() => setModalType("EDIT_ARTIFACT")}
      />

      <Modal
        active={modalType === "CONFIG_FILTER"}
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
        active={modalType === "ADD_ARTIFACT" || modalType === "EDIT_ARTIFACT"}
        {...dynamicForgeProps}
        hasConfigStep
        onForgeArtifact={(artifact) => {
          if (modalType === "ADD_ARTIFACT") {
            if (isNewArtifactAddable()) {
              const newUserArtifact: UserArtifact = {
                ...artifact,
                ID: Date.now(),
                owner: null,
              };

              dispatch(addUserArtifact(newUserArtifact));
              setChosenId(newUserArtifact.ID);
            }
          } else if (chosenArtifact) {
            dispatch(
              updateUserArtifact({
                ...artifact,
                ID: chosenArtifact.ID,
              })
            );
          }
        }}
        onClose={closeModal}
      />
    </WarehouseLayout>
  );
}

export function MyArtifactsWrapper() {
  const appReady = useSelector(selectAppReady);

  if (!appReady) {
    return (
      <WarehouseLayout className="h-full relative">
        <div className="absolute inset-0 flex-center">
          <LoadingPlate />
        </div>
      </WarehouseLayout>
    );
  }

  return <MyArtifacts />;
}
