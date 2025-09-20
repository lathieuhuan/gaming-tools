import { AppArtifact, ArtifactType } from "@Calculation";
import { useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { ButtonGroup, FancyBackSvg, Modal } from "rond";

import type { Artifact } from "@/types";

import { useArtifactTypeSelect } from "@/hooks";
import { $AppArtifact } from "@/services";
import Entity_ from "@/utils/Entity";
import Object_ from "@/utils/Object";

// Component
import {
  AppEntitySelect,
  AppEntitySelectProps,
  AfterSelectAppEntity,
} from "@/components/AppEntitySelect";
import { GenshinImage } from "@/components/GenshinImage";
import { ArtifactConfig } from "./ArtifactConfig";

export interface ArtifactForgeProps
  extends Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> {
  /** Initital config */
  workpiece?: Artifact;
  initialMaxRarity?: number;
  /** Only works when hasConfigStep */
  allowBatchForging?: boolean;
  /** Only works when hasConfigStep */
  defaultBatchForging?: boolean;
  forFeature?: "TEAMMATE_MODIFIERS";
  forcedType?: ArtifactType;
  /** Default to 'flower' */
  initialTypes?: ArtifactType | ArtifactType[];
  onForgeArtifact: (info: ReturnType<typeof Entity_.createArtifact>) => void;
  onForgeArtifactBatch?: (code: AppArtifact["code"], types: ArtifactType[], rarity: number) => void;
  onClose: () => void;
}
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
  const [artifactConfig, setArtifactConfig] = useState<Artifact | undefined>(workpiece);
  const [maxRarity, setMaxRarity] = useState(initialMaxRarity);
  const [batchForging, setBatchForging] = useState(defaultBatchForging);

  const updateConfig = (
    changesOrUpdater: Partial<Artifact> | ((prevConfig: Artifact) => Artifact)
  ) => {
    if (artifactConfig) {
      const newConfig =
        typeof changesOrUpdater === "function"
          ? changesOrUpdater(artifactConfig)
          : { ...artifactConfig, ...changesOrUpdater };

      setArtifactConfig(newConfig);
    }
  };

  const { artifactTypes, artifactTypeSelectProps, updateArtifactTypes, ArtifactTypeSelect } =
    useArtifactTypeSelect(workpiece?.type || forcedType || initialTypes, {
      multiple: batchForging,
      required: batchForging,
      onChange: (types) => {
        updateConfig((prevConfig) => {
          const newConfig = Entity_.createArtifact({ ...prevConfig, type: types[0] });
          const prevConfigKeep = Object_.pickProps(prevConfig, ["ID", "level", "subStats"]);

          return Object_.assign(newConfig, prevConfigKeep);
        });
      },
    });

  const allArtifactSets = useMemo(() => {
    const artifacts =
      forFeature === "TEAMMATE_MODIFIERS"
        ? $AppArtifact
            .getAll()
            .filter(
              (set) => set.buffs?.some((buff) => buff.affect !== "SELF") || set.debuffs?.length
            )
        : $AppArtifact.getAll();

    return artifacts.map((artifact) => {
      const { code, beta, name, variants, flower } = artifact;
      return {
        code,
        beta,
        name,
        rarity: variants[variants.length - 1],
        icon: forcedType ? artifact[forcedType].icon : flower.icon,
      };
    });
  }, []);

  const handleRarityChange = (rarity: number) => {
    updateConfig((prevConfig) => {
      return {
        ...prevConfig,
        rarity,
        level: Math.min(prevConfig.level, rarity === 5 ? 20 : 16),
      };
    });
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
      onForgeArtifactBatch?.(artifactConfig.code, artifactTypes, artifactConfig.rarity);
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
                  className="bg-surface-3 rounded"
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
      data={allArtifactSets}
      initialChosenCode={workpiece?.code}
      emptyText="No artifacts found"
      hasSearch
      renderOptionConfig={(afterSelect, selectBody) => {
        return (
          <ArtifactConfig
            config={artifactConfig}
            maxRarity={maxRarity}
            typeSelect={forcedType ? null : <ArtifactTypeSelect {...artifactTypeSelectProps} />}
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
      onChange={(mold, isConfigStep) => {
        if (mold) {
          if (isConfigStep) {
            const newConfig = Entity_.createArtifact(
              {
                ...artifactConfig,
                ...mold,
                type: forcedType || artifactTypes[0],
              },
              0
            );

            setArtifactConfig(newConfig);
            setMaxRarity(mold.rarity);
          } else {
            onForgeArtifact(Entity_.createArtifact({ ...mold, type: artifactTypes[0] }));
          }
        } else {
          setArtifactConfig(undefined);
        }
        return true;
      }}
      onClose={onClose}
      {...templateProps}
    />
  );
};

export const ArtifactForge = Modal.coreWrap(ArtifactSmith, { preset: "large" });
