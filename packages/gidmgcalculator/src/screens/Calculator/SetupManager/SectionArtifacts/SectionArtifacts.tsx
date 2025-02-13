import { useEffect, useState } from "react";
import { FaToolbox } from "react-icons/fa";
import { GiAnvil } from "react-icons/gi";
import { Button, clsx, CollapseSpace, notification, PouchSvg } from "rond";
import { ARTIFACT_TYPES, ArtifactType } from "@Backend";

import type { Artifact, CalcArtifact } from "@Src/types";
import { $AppArtifact, $AppSettings } from "@Src/services";
import { useArtifactSetData } from "@Src/hooks";
import Entity_ from "@Src/utils/entity-utils";
import { changeArtifact, selectArtifacts } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import {
  ArtifactForge,
  ArtifactForgeProps,
  ArtifactInventory,
  ArtifactInventoryProps,
  GenshinImage,
  LoadoutStash,
} from "@Src/components";
import { ArtifactInfo, ArtifactSourceType } from "./ArtifactInfo";
import { CopySelect } from "./CopySelect";

import styles from "../SetupManager.styles.module.scss";

type ModalType = "ARTIFACT_LOADOUT" | "";

type InventoryState = {
  active: boolean;
  initialType?: ArtifactType;
};

type ForgeState = Pick<ArtifactForgeProps, "hasConfigStep"> & {
  active: boolean;
  initialType?: ArtifactType;
};

const SECTION_ID = "calculator-section-artifacts";

export default function SectionArtifacts() {
  const dispatch = useDispatch();
  const artifacts = useSelector(selectArtifacts);
  const setData = useArtifactSetData();

  const [modalType, setModalType] = useState<ModalType>("");
  const [activeTabIndex, setActiveTabIndex] = useState(-1);

  const [inventory, setInventory] = useState<InventoryState>({
    active: false,
  });
  const [forge, setForge] = useState<ForgeState>({
    active: false,
  });

  const activeArtifact = artifacts[activeTabIndex];

  const closeModal = () => setModalType("");

  useEffect(() => {
    if (activeTabIndex >= 0) {
      setTimeout(() => {
        document.querySelector(`#${SECTION_ID}`)?.scrollIntoView();
      }, 200);
    }
  }, [activeTabIndex]);

  useEffect(() => {
    if (!activeArtifact && activeTabIndex !== -1) {
      setActiveTabIndex(-1);
    }
  }, [!activeArtifact]);

  const onClickTab = (tabIndex: number) => {
    // there's already an artifact at tabIndex (or activeArtifact !== null after this excution)
    if (artifacts[tabIndex]) {
      // if click on the activeTab close it, otherwise change tab
      setActiveTabIndex(tabIndex === activeTabIndex ? -1 : tabIndex);
    } else {
      setForge({
        active: true,
        initialType: ARTIFACT_TYPES[tabIndex],
      });
    }
  };

  const replaceArtifact = (type: ArtifactType, newPiece: Artifact, shouldKeepStats = false) => {
    const pieceIndex = ARTIFACT_TYPES.indexOf(type);

    dispatch(changeArtifact({ pieceIndex, newPiece, shouldKeepStats }));
    setActiveTabIndex(pieceIndex);
  };

  // ===== CHANGE ARTIFACTS WITH LOADOUTS =====

  const onRequestSelectArtifactLoadout = () => {
    setModalType("ARTIFACT_LOADOUT");
  };

  const onSelectLoadout = (artifacts: CalcArtifact[]) => {
    for (const artifact of artifacts) {
      dispatch(
        changeArtifact({
          pieceIndex: ARTIFACT_TYPES.indexOf(artifact.type),
          newPiece: artifact,
        })
      );
    }
    closeModal();
  };

  // ===== CHANGE ARTIFACT(S) WITH INVENTORY =====

  const onRequestSelectInventoryArtifact = () => {
    setInventory({
      active: true,
      initialType: "flower",
    });
  };

  const onSelectInventoryArtifact: ArtifactInventoryProps["onClickButton"] = (artifact) => {
    replaceArtifact(artifact.type, Entity_.userItemToCalcItem(artifact));

    const artifactSet = $AppArtifact.getSet(artifact.code);

    if (artifactSet) {
      notification.destroy("ALL");
      notification.success({
        content: `Selected ${artifactSet.name} (${artifact.type})`,
      });
    }
  };

  // ===== CHANGE ARTIFACT(S) WITH FORGE =====

  const onRequestForgeArtifact = () => {
    setForge({
      active: true,
      initialType: "flower",
      hasConfigStep: true,
    });
  };

  const onForgeArtifact: ArtifactForgeProps["onForgeArtifact"] = (artifact) => {
    const newPiece = {
      ...artifact,
      ID: Date.now(),
    };
    const artifactSet = $AppArtifact.getSet(artifact.code);

    if (artifactSet) {
      notification.destroy("ALL");
      notification.success({
        content: `Forged ${artifactSet.name} (${artifact.type})`,
      });
    }

    replaceArtifact(artifact.type, newPiece, $AppSettings.get("doKeepArtStatsOnSwitch"));
  };

  const onForgeArtifactBatch: ArtifactForgeProps["onForgeArtifactBatch"] = (code, types, rarity) => {
    let rootID = Date.now();

    for (const type of types) {
      const newPiece = Entity_.createArtifact({ code, type, rarity });

      dispatch(
        changeArtifact({
          pieceIndex: ARTIFACT_TYPES.indexOf(type),
          newPiece: { ...newPiece, ID: rootID++ },
          shouldKeepStats: $AppSettings.get("doKeepArtStatsOnSwitch"),
        })
      );
    }
    if (activeTabIndex === -1 && types[0]) {
      setActiveTabIndex(Math.min(...types.map((type) => ARTIFACT_TYPES.indexOf(type))));
    }
    const artifactSet = $AppArtifact.getSet(code);

    if (artifactSet) {
      notification.success({
        content: (
          <>
            Forged {artifactSet.name}: <span className="capitalize">{types.join(", ")}</span>
          </>
        ),
      });
    }
  };

  // ===== ACTIONS TOWARDS ACTIVE ARTIFACT =====

  const onRequestChangeActiveArtifact = (source: ArtifactSourceType) => {
    const newState = {
      active: true,
      initialType: ARTIFACT_TYPES[activeTabIndex],
    };
    switch (source) {
      case "LOADOUT":
        onRequestSelectArtifactLoadout();
        break;
      case "INVENTORY":
        setInventory(newState);
        break;
      case "FORGE":
        setForge(newState);
        break;
    }
  };

  const onRemoveArtifact = () => {
    setActiveTabIndex(-1);
  };

  return (
    <div id={SECTION_ID} className={`py-3 bg-surface-1 ${styles.section}`}>
      {artifacts.length && artifacts.every((artifact) => artifact === null) ? <CopySelect /> : null}

      <div className="flex">
        {ARTIFACT_TYPES.map((type, index) => {
          const artifact = artifacts[index];
          const data = artifact?.code ? setData.get(artifact.code) : null;
          const icon = data?.[type].icon || Entity_.artifactIconOf(type);

          return (
            <div
              key={index}
              className={clsx(
                "w-1/5 border-2",
                index === activeTabIndex ? "border-light-default" : "border-transparent"
              )}
              onClick={() => onClickTab(index)}
            >
              <GenshinImage
                className={clsx(
                  `h-full bg-gradient-${artifact ? artifact.rarity || 5 : 1} cursor-pointer`,
                  !artifact && "p-2 opacity-80"
                )}
                title={data?.name}
                src={icon}
                fallbackCls={artifact ? "p-3" : "p-1"}
                imgType="unknown"
              />
            </div>
          );
        })}
      </div>

      <CollapseSpace active={activeTabIndex !== -1}>
        {activeArtifact && (
          <ArtifactInfo
            artifact={activeArtifact}
            pieceIndex={activeTabIndex}
            onRequestChange={onRequestChangeActiveArtifact}
            onRemove={onRemoveArtifact}
          />
        )}
      </CollapseSpace>

      {activeTabIndex < 0 ? (
        <div className="mt-4 px-4 flex justify-end gap-4">
          <Button title="Loadout" icon={<FaToolbox className="text-lg" />} onClick={onRequestSelectArtifactLoadout} />
          <Button
            title="Inventory"
            icon={<PouchSvg className="text-xl" />}
            onClick={onRequestSelectInventoryArtifact}
          />
          <Button title="New" icon={<GiAnvil className="text-xl" />} onClick={onRequestForgeArtifact} />
        </div>
      ) : null}

      <ArtifactForge
        active={forge.active}
        initialTypes={forge.initialType}
        forcedType={forge.hasConfigStep ? undefined : forge.initialType}
        hasConfigStep={forge.hasConfigStep}
        // hasMultipleMode is the same as hasConfigStep
        hasMultipleMode={forge.hasConfigStep}
        allowBatchForging
        defaultBatchForging
        onForgeArtifact={onForgeArtifact}
        onForgeArtifactBatch={onForgeArtifactBatch}
        onClose={() => setForge((prevForge) => ({ ...prevForge, active: false }))}
      />

      <ArtifactInventory
        {...inventory}
        hasMultipleMode
        currentArtifacts={artifacts}
        buttonText="Select"
        onClickButton={onSelectInventoryArtifact}
        onClose={() => setInventory((prevInventory) => ({ ...prevInventory, active: false }))}
      />

      <LoadoutStash active={modalType === "ARTIFACT_LOADOUT"} onSelect={onSelectLoadout} onClose={closeModal} />
    </div>
  );
}
