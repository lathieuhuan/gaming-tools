import { useState } from "react";
import { OverflowTrackingContainer } from "rond";
import type { OptimizerArtifactBuffConfigs } from "@Backend";
import type { ArtifactManager } from "../../controllers/artifact-manager";

import { GenshinModifierView } from "@Src/components";
import { getArtifactDescription } from "@Src/components/modifier-list/modifiers.utils";
import Array_ from "@Src/utils/array-utils";

interface ArtifactModConfigProps {
  artifactManager: ArtifactManager;
}
export function ArtifactModConfig({ artifactManager }: ArtifactModConfigProps) {
  const [configs, setConfigs] = useState<OptimizerArtifactBuffConfigs>(artifactManager.buffConfigs);

  return (
    <div className="h-full flex flex-col">
      <p>Artifact buffs to be activated (if any)</p>

      <OverflowTrackingContainer className="mt-2 grow custom-scrollbar" overflowedCls="pr-3" wrapCls="space-y-2">
        {artifactManager.sets.map(({ data }) => {
          const configsByCode = configs[data.code] || [];
          if (!configsByCode.length || !data.buffs) return null;

          return (
            <div key={data.code} className="p-3 bg-surface-1 rounded space-y-2">
              {configsByCode.map((config, configIndex) => {
                const buff = Array_.findByIndex(data.buffs, config.index);
                if (!buff) return null;

                const description = getArtifactDescription(data, buff);

                const changeThisInput = (value: number, inpIndex: number) => {
                  if (config.inputs) {
                    const newInputs = [...config.inputs];
                    newInputs[inpIndex] = value;

                    setConfigs(artifactManager.changeBuffConfigInputs(data.code, configIndex, newInputs));
                  }
                };

                return (
                  <GenshinModifierView
                    key={`${data.code}-${config.index}`}
                    mutable
                    checked={config.activated}
                    heading={data.name}
                    description={description}
                    inputs={config.inputs}
                    inputConfigs={buff.inputConfigs}
                    onToggle={() => {
                      setConfigs(artifactManager.toggleBuffConfig(data.code, configIndex));
                    }}
                    onToggleCheck={(input, index) => {
                      changeThisInput(input ? 0 : 1, index);
                    }}
                    onChangeText={changeThisInput}
                    onSelectOption={changeThisInput}
                  />
                );
              })}
            </div>
          );
        })}
      </OverflowTrackingContainer>
    </div>
  );
}
