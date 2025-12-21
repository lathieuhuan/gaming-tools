import { useEffect, useState } from "react";
import { FaToolbox } from "react-icons/fa";
import { GiAnvil } from "react-icons/gi";
import { Button, clsx, CollapseSpace, notification, PouchSvg } from "rond";

import type { ArtifactType } from "@/types";

import { ARTIFACT_TYPES } from "@/constants/global";
import { Artifact } from "@/models/base";
import { $AppSettings } from "@/services";
import { setArtifactPiece } from "@Store/calculator/actions";
import { selectActiveMain } from "@Store/calculator/selectors";

// Component
import {
  ArtifactForge,
  ArtifactForgeProps,
  ArtifactInventory,
  ArtifactInventoryProps,
  GenshinImage,
  LoadoutStash,
  LoadoutStashProps,
} from "@/components";
import { useCalcStore } from "@Store/calculator";
import { Section } from "../_components/Section";
import { ArtifactInfo, ArtifactSourceType } from "./ArtifactInfo";
import { CopySelect } from "./CopySelect";

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
  const [modalType, setModalType] = useState<ModalType>("");
  const [activeArtifactType, setActiveArtifactType] = useState<ArtifactType>();

  const atfGear = useCalcStore((state) => selectActiveMain(state).atfGear);

  const [inventory, setInventory] = useState<InventoryState>({
    active: false,
  });
  const [forge, setForge] = useState<ForgeState>({
    active: false,
  });

  const { pieces } = atfGear;
  const activePiece = activeArtifactType ? pieces[activeArtifactType] : undefined;

  const closeModal = () => setModalType("");

  useEffect(() => {
    if (activeArtifactType) {
      setTimeout(() => {
        document.querySelector(`#${SECTION_ID}`)?.scrollIntoView();
      }, 200);
    }
  }, [activeArtifactType]);

  useEffect(() => {
    if (!activePiece && activeArtifactType !== null) {
      setActiveArtifactType(undefined);
    }
  }, [!activePiece]);

  const handleClickTab = (type: ArtifactType) => {
    // there's already an artifact at tabIndex (or activePiece !== null after this excution)
    if (pieces[type]) {
      // if click on the activeTab close it, otherwise change tab
      setActiveArtifactType(activeArtifactType === type ? undefined : type);
    } else {
      setForge({
        active: true,
        initialType: type,
      });
    }
  };

  // ===== CHANGE ARTIFACTS WITH LOADOUTS =====

  const handleRequestSelectArtifactLoadout = () => {
    setModalType("ARTIFACT_LOADOUT");
  };

  const handleSelectLoadout: LoadoutStashProps["onSelect"] = (pieces) => {
    for (const piece of pieces) {
      setArtifactPiece(piece.userData, piece.data);
    }
    closeModal();
  };

  // ===== CHANGE ARTIFACT(S) WITH INVENTORY =====

  const handleRequestArtifactInventory = () => {
    setInventory({
      active: true,
      initialType: "flower",
    });
  };

  const handleSelectInventoryArtifact: ArtifactInventoryProps["onClickButton"] = (artifact) => {
    notification.destroy("ALL");
    notification.success({
      content: `Selected ${artifact.data.name} (${artifact.type})`,
    });

    setArtifactPiece(artifact, artifact.data);
    setActiveArtifactType(artifact.type);
  };

  // ===== CHANGE ARTIFACT(S) WITH FORGE =====

  const handleRequestArtifactForge = () => {
    setForge({
      active: true,
      initialType: "flower",
      hasConfigStep: true,
    });
  };

  const handleForgeArtifact: ArtifactForgeProps["onForgeArtifact"] = (artifact) => {
    notification.destroy("ALL");
    notification.success({
      content: `Forged ${artifact.data.name} (${artifact.type})`,
    });

    setArtifactPiece(artifact, artifact.data, $AppSettings.get("keepArtStatsOnSwitch"));
    setActiveArtifactType(artifact.type);
  };

  const handleForgeArtifactBatch: ArtifactForgeProps["onForgeArtifactBatch"] = (
    types,
    rarity,
    data
  ) => {
    let rootID = Date.now();
    let leftMostIndex = Infinity;

    for (const type of types) {
      setArtifactPiece(
        {
          ID: rootID++,
          code: data.code,
          type,
          rarity,
        },
        data,
        $AppSettings.get("keepArtStatsOnSwitch")
      );

      const index = ARTIFACT_TYPES.indexOf(type);

      if (index < leftMostIndex) {
        leftMostIndex = index;
      }
    }

    if (!activeArtifactType && leftMostIndex !== Infinity) {
      setActiveArtifactType(ARTIFACT_TYPES[leftMostIndex]);
    }

    notification.success({
      content: (
        <>
          Forged {data.name}: <span className="capitalize">{types.join(", ")}</span>
        </>
      ),
    });
  };

  // ===== ACTIONS TOWARDS ACTIVE ARTIFACT =====

  const onRequestChangeActiveArtifact = (source: ArtifactSourceType) => {
    const newState = {
      active: true,
      initialType: activeArtifactType,
    };
    switch (source) {
      case "LOADOUT":
        handleRequestSelectArtifactLoadout();
        break;
      case "INVENTORY":
        setInventory(newState);
        break;
      case "FORGE":
        setForge(newState);
        break;
    }
  };

  const handleRemoveArtifact = () => {
    setActiveArtifactType(undefined);
  };

  return (
    <Section id={SECTION_ID} className="py-3 bg-dark-1">
      {Array.from(pieces).length === 0 && <CopySelect />}

      <div className="flex">
        {ARTIFACT_TYPES.map((type) => {
          const piece = pieces[type];
          const icon = piece?.data?.[type].icon || Artifact.iconOf(type);

          return (
            <div
              key={type}
              className={clsx(
                "w-1/5 border-2",
                type === activeArtifactType ? "border-light-1" : "border-transparent"
              )}
              onClick={() => handleClickTab(type)}
            >
              <GenshinImage
                className={clsx(
                  `h-full bg-gradient-${piece ? piece.rarity || 5 : 1} cursor-pointer`,
                  !piece && "p-2 opacity-80"
                )}
                title={piece?.data?.name}
                src={icon}
                fallbackCls={piece ? "p-3" : "p-1"}
                imgType="unknown"
              />
            </div>
          );
        })}
      </div>

      <CollapseSpace active={activeArtifactType !== null}>
        {activePiece && (
          <ArtifactInfo
            artifact={activePiece}
            onRequestChange={onRequestChangeActiveArtifact}
            onRemove={handleRemoveArtifact}
          />
        )}
      </CollapseSpace>

      {!activeArtifactType && (
        <div className="mt-4 px-4 flex justify-end gap-4">
          <Button
            title="Loadout"
            icon={<FaToolbox className="text-lg" />}
            onClick={handleRequestSelectArtifactLoadout}
          />
          <Button
            title="Inventory"
            icon={<PouchSvg className="text-xl" />}
            onClick={handleRequestArtifactInventory}
          />
          <Button
            title="New"
            icon={<GiAnvil className="text-xl" />}
            onClick={handleRequestArtifactForge}
          />
        </div>
      )}

      <ArtifactForge
        active={forge.active}
        initialTypes={forge.initialType}
        forcedType={forge.hasConfigStep ? undefined : forge.initialType}
        hasConfigStep={forge.hasConfigStep}
        // hasMultipleMode is the same as hasConfigStep
        hasMultipleMode={forge.hasConfigStep}
        allowBatchForging
        defaultBatchForging
        onForgeArtifact={handleForgeArtifact}
        onForgeArtifactBatch={handleForgeArtifactBatch}
        onClose={() => setForge((prevForge) => ({ ...prevForge, active: false }))}
      />

      <ArtifactInventory
        {...inventory}
        hasMultipleMode
        currentAtfGear={atfGear}
        buttonText="Select"
        onClickButton={handleSelectInventoryArtifact}
        onClose={() => setInventory((prevInventory) => ({ ...prevInventory, active: false }))}
      />

      <LoadoutStash
        active={modalType === "ARTIFACT_LOADOUT"}
        onSelect={handleSelectLoadout}
        onClose={closeModal}
      />
    </Section>
  );
}
