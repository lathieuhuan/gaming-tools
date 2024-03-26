import { useMemo, useState } from "react";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useScreenWatcher, Modal } from "rond";

import type { Artifact, ArtifactType } from "@Src/types";
import { $AppData } from "@Src/services";
import { pickProps, Artifact_ } from "@Src/utils";
import { useArtifactTypeSelect } from "@Src/hooks";

// Component
import { AppEntitySelect, AppEntitySelectProps } from "./components/AppEntitySelect";
import { ArtifactConfig } from "./components/ArtifactConfig";

export interface ArtifactForgeProps extends Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> {
  forFeature?: "TEAMMATE_MODIFIERS";
  forcedType?: ArtifactType;
  /** Default to 'flower' */
  initialTypes?: ArtifactType | ArtifactType[];
  onForgeArtifact: (info: ReturnType<typeof Artifact_.create>) => void;
  onClose: () => void;
}
const ArtifactSmith = ({
  forFeature,
  forcedType,
  initialTypes = "flower",
  onForgeArtifact,
  onClose,
  ...templateProps
}: ArtifactForgeProps) => {
  const screenWatcher = useScreenWatcher();
  const [artifactConfig, setArtifactConfig] = useState<Artifact>();
  const [maxRarity, setMaxRarity] = useState(5);

  const updateConfig = (update: (prevConfig: Artifact) => Artifact) => {
    if (artifactConfig) {
      setArtifactConfig(update(artifactConfig));
    }
  };

  const { artifactTypes, renderArtifactTypeSelect } = useArtifactTypeSelect(forcedType || initialTypes, {
    onChange: (types) => {
      updateConfig((prevConfig) => {
        const newConfig = Artifact_.create({ ...prevConfig, type: types[0] as ArtifactType });
        return Object.assign(newConfig, pickProps(prevConfig, ["ID", "level", "subStats"]));
      });
    },
  });

  const allArtifactSets = useMemo(() => {
    const artifacts =
      forFeature === "TEAMMATE_MODIFIERS"
        ? $AppData
            .getAllArtifacts()
            .filter((set) => set.buffs?.some((buff) => buff.affect !== "SELF") || set.debuffs?.length)
        : $AppData.getAllArtifacts();

    return artifacts.map((artifact) => {
      const { code, beta, name, variants, flower } = artifact;
      return {
        code,
        beta,
        name,
        rarity: variants[variants.length - 1],
        icon: flower.icon,
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

  return (
    <AppEntitySelect
      title={<p className="text-base sm:text-xl leading-7">Artifact Forge</p>}
      data={allArtifactSets}
      emptyText="No artifacts found"
      hasSearch
      renderOptionConfig={(afterSelect, selectBody) => {
        return (
          <ArtifactConfig
            config={artifactConfig}
            maxRarity={maxRarity}
            typeSelect={forcedType ? null : renderArtifactTypeSelect()}
            moreButtons={
              screenWatcher.isFromSize("sm")
                ? undefined
                : [
                    {
                      icon: <RiArrowGoBackLine className="text-lg" />,
                      onClick: () => {
                        if (selectBody) selectBody.scrollLeft = 0;
                      },
                    },
                  ]
            }
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
          const artifact = Artifact_.create({
            ...mold,
            type: artifactTypes[0],
          });

          if (isConfigStep) {
            setArtifactConfig({
              ...artifact,
              ...(forcedType ? { type: forcedType } : undefined),
              ID: 0,
            });
            setMaxRarity(mold.rarity);
          } else {
            onForgeArtifact(artifact);
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
