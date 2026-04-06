import { useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { ButtonGroup, FancyBackSvg, Modal, useValues } from "rond";

import type { AppArtifact, ArtifactType, ArtifactStateData } from "@/types";
import type { Artifact } from "@/models";

import { $AppArtifact } from "@/services";
import { createArtifact } from "@/logic/entity.logic";

// Component
import {
  AfterSelectAppEntity,
  AppEntityOptionModel,
  AppEntitySelect,
  AppEntitySelectProps,
} from "@/components/AppEntitySelect";
import { ArtifactTypeSelect } from "@/components/ArtifactTypeSelect";
import { GenshinImage } from "@/components/GenshinImage";
import { ArtifactConfig } from "./ArtifactConfig";

type ArtifactOption = AppEntityOptionModel & {
  rarity: number;
  data: AppArtifact;
};

export type ArtifactForgeProps = Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> & {
  /** Initital config */
  workpiece?: Artifact;
  initialMaxRarity?: number;
  /** Only works when hasConfigStep */
  allowBatchForging?: boolean;
  /** Only works when hasConfigStep */
  defaultBatchForging?: boolean;
  forFeature?: "TEAMMATE_MODIFIERS";
  forcedType?: ArtifactType;
  /** Default 'flower' */
  initialTypes?: ArtifactType | ArtifactType[];
  onForgeArtifact: (info: Artifact) => void;
  onForgeArtifactBatch?: (types: ArtifactType[], rarity: number, data: AppArtifact) => void;
  onClose: () => void;
};

const ArtifactSmith = ({
  workpiece,
  initialMaxRarity = 5,
  allowBatchForging,
  defaultBatchForging = false,
  forFeature,
  forcedType,
  initialTypes = "flower",
  onForgeArtifact,
  onForgeArtifactBatch,
  onClose,
  ...templateProps
}: ArtifactForgeProps) => {
  const [artifactConfig, setArtifactConfig] = useState(workpiece);
  const [maxRarity, setMaxRarity] = useState(initialMaxRarity);
  const [batchForging, setBatchForging] = useState(defaultBatchForging);

  const updateConfig = (
    changesOrUpdater:
      | Partial<ArtifactStateData>
      | ((prevConfig: Artifact) => Partial<ArtifactStateData>)
  ) => {
    if (!artifactConfig) {
      return;
    }

    const newState =
      typeof changesOrUpdater === "function" ? changesOrUpdater(artifactConfig) : changesOrUpdater;

    setArtifactConfig(artifactConfig.clone({ state: newState }));
  };

  const {
    values: artifactTypes,
    toggle: toggleArtifactType,
    update: updateArtifactTypes,
  } = useValues({
    initial: workpiece?.type || forcedType || initialTypes,
    multiple: batchForging,
    required: batchForging,
    onChange: (types) => {
      updateConfig({ type: types[0] });
    },
  });

  const artifactOptions = useMemo(() => {
    let artifacts = $AppArtifact.getAll();

    if (forFeature === "TEAMMATE_MODIFIERS") {
      artifacts = artifacts.filter(
        (set) => set.buffs?.some((buff) => buff.affect !== "SELF") || set.debuffs?.length
      );
    }

    return artifacts.map<ArtifactOption>((artifact) => {
      const { code, beta, name, variants, flower } = artifact;
      return {
        code,
        beta,
        name,
        rarity: variants[variants.length - 1],
        icon: forcedType ? artifact[forcedType].icon : flower.icon,
        data: artifact,
      };
    });
  }, []);

  const handleRarityChange = (rarity: number) => {
    updateConfig((prevConfig) => {
      return {
        rarity,
        level: Math.min(prevConfig.level, rarity === 5 ? 20 : 16),
      };
    });
  };

  const handleSelectOption: AppEntitySelectProps<ArtifactOption>["onChange"] = (
    mold,
    isConfigStep
  ) => {
    if (!mold) {
      setArtifactConfig(undefined);
      return;
    }

    if (isConfigStep) {
      const artifact = createArtifact(
        {
          ID: Date.now(),
          code: mold.code,
          ...artifactConfig?.state,
          rarity: mold.rarity,
          type: forcedType || artifactTypes[0],
        },
        mold.data
      );

      setArtifactConfig(artifact);
      setMaxRarity(mold.rarity);
      return;
    }

    const artifact = createArtifact(
      {
        ID: Date.now(),
        code: mold.code,
        rarity: mold.rarity,
        type: artifactTypes[0],
      },
      mold.data
    );

    onForgeArtifact(artifact);
  };

  const getBackAction = (selectBody: HTMLDivElement | null) => ({
    icon: <FancyBackSvg />,
    className: "sm:hidden",
    onClick: () => {
      if (selectBody) selectBody.scrollLeft = 0;
    },
  });

  const renderBatchConfigNode = (
    afterSelect: AfterSelectAppEntity,
    selectBody: HTMLDivElement | null
  ) => {
    if (!batchForging || !artifactConfig) return;
    const artifactSet = $AppArtifact.getSet(artifactConfig.code);
    if (!artifactSet) return;

    const onStopBatchForging = () => {
      const newArtifactType = artifactTypes[0] ?? "flower";
      setBatchForging(false);
      updateArtifactTypes([newArtifactType]);
    };

    const onBatchForge = () => {
      onForgeArtifactBatch?.(artifactTypes, artifactConfig.rarity, artifactSet);
      afterSelect(artifactConfig.code, artifactTypes.length);
    };

    return (
      <div className="pt-4 px-1 border-t border-light-900">
        <div className="flex items-start">
          <FaInfoCircle className="mr-1 text-secondary-1 text-lg" />

          <div>
            <h5 className="text-secondary-1 text-sm font-semibold">Batch Forging</h5>
            <p className="text-sm">You can select multiple Artifact types.</p>
          </div>
        </div>

        <div className="mt-2">
          <p className={`text-rarity-${artifactConfig.rarity} text-lg font-semibold`}>
            {artifactSet.name}
          </p>
          <div className="mt-1 flex">
            {artifactTypes.map((type) => (
              <div key={type} className="w-1/5 p-1">
                <GenshinImage
                  className="bg-dark-3 rounded"
                  fallbackCls="p-2"
                  src={artifactSet[type].icon}
                />
              </div>
            ))}
          </div>
        </div>

        <ButtonGroup
          className="mt-4"
          buttons={[
            getBackAction(selectBody),
            {
              children: "Single",
              onClick: onStopBatchForging,
            },
            {
              children: "Forge",
              variant: "primary",
              onClick: onBatchForge,
            },
          ]}
        />
      </div>
    );
  };

  return (
    <AppEntitySelect
      title={<p className="text-base sm:text-xl leading-7">Artifact Forge</p>}
      data={artifactOptions}
      initialActiveCode={workpiece?.code}
      emptyText="No artifacts found"
      hasSearch
      renderOptionConfig={(afterSelect, selectBody) => {
        return (
          <ArtifactConfig
            config={artifactConfig}
            maxRarity={maxRarity}
            typeSelect={
              forcedType ? null : (
                <ArtifactTypeSelect values={artifactTypes} onSelect={toggleArtifactType} />
              )
            }
            batchConfigNode={renderBatchConfigNode(afterSelect, selectBody)}
            mainActionLabel={workpiece ? "Reforge" : "Forge"}
            moreButtons={[
              getBackAction(selectBody),
              {
                children: "Batch",
                className: !allowBatchForging && "hidden",
                onClick: () => setBatchForging(true),
              },
            ]}
            onRarityChange={handleRarityChange}
            onConfigUpdate={updateConfig}
            onSelect={(config) => {
              onForgeArtifact(config);
              afterSelect(config.code);
            }}
          />
        );
      }}
      onChange={handleSelectOption}
      onClose={onClose}
      {...templateProps}
    />
  );
};

export const ArtifactForge = Modal.coreWrap(ArtifactSmith, { preset: "large" });
