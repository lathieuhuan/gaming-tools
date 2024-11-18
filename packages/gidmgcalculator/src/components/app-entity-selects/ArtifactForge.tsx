import { useMemo, useState } from "react";
import { RiArrowGoBackLine } from "react-icons/ri";
import { FaInfoCircle } from "react-icons/fa";
import { ButtonGroup, Modal } from "rond";
import { AppArtifact, ArtifactType } from "@Backend";

import type { Artifact } from "@Src/types";
import { $AppArtifact } from "@Src/services";
import Object_ from "@Src/utils/object-utils";
import Entity_ from "@Src/utils/entity-utils";
import { useArtifactTypeSelect } from "@Src/hooks";

// Component
import { GenshinImage } from "../GenshinImage";
import { AppEntitySelect, type AppEntitySelectProps, type AfterSelectAppEntity } from "./components/AppEntitySelect";
import { ArtifactConfig } from "./components/ArtifactConfig";

export interface ArtifactForgeProps extends Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> {
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

  const updateConfig = (update: (prevConfig: Artifact) => Artifact) => {
    if (artifactConfig) {
      setArtifactConfig(update(artifactConfig));
    }
  };

  const { artifactTypes, updateArtifactTypes, renderArtifactTypeSelect } = useArtifactTypeSelect(
    workpiece?.type || forcedType || initialTypes,
    {
      multiple: batchForging,
      required: batchForging,
      onChange: (types) => {
        updateConfig((prevConfig) => {
          const newConfig = Entity_.createArtifact({ ...prevConfig, type: types[0] });
          return Object.assign(newConfig, Object_.pickProps(prevConfig, ["ID", "level", "subStats"]));
        });
      },
    }
  );

  const allArtifactSets = useMemo(() => {
    const artifacts =
      forFeature === "TEAMMATE_MODIFIERS"
        ? $AppArtifact
            .getAll()
            .filter((set) => set.buffs?.some((buff) => buff.affect !== "SELF") || set.debuffs?.length)
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

  const onChangeRarity = (rarity: number) => {
    updateConfig((prevConfig) => {
      return {
        ...prevConfig,
        rarity,
        level: Math.min(prevConfig.level, rarity === 5 ? 20 : 16),
      };
    });
  };

  const getBackAction = (selectBody: HTMLDivElement | null) => ({
    icon: <RiArrowGoBackLine className="text-lg" />,
    className: "sm:hidden",
    onClick: () => {
      if (selectBody) selectBody.scrollLeft = 0;
    },
  });

  const renderBatchConfigNode = (afterSelect: AfterSelectAppEntity, selectBody: HTMLDivElement | null) => {
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
            <p className="text-sm">You now can select multiple Artifact types.</p>
          </div>
        </div>

        <div className="mt-2">
          <p className={`text-rarity-${artifactConfig.rarity} text-lg font-semibold`}>{artifactSet.name}</p>
          <div className="mt-1 flex">
            {artifactTypes.map((type) => (
              <div key={type} className="w-1/5 p-1">
                <GenshinImage className="bg-surface-3 rounded" fallbackCls="p-2" src={artifactSet[type].icon} />
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
            typeSelect={forcedType ? null : renderArtifactTypeSelect()}
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
            onChangeRarity={onChangeRarity}
            onUpdateConfig={(properties) => {
              updateConfig((prevConfig) => ({ ...prevConfig, ...properties }));
            }}
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
