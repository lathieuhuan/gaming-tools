import { useState } from "react";
import type { OptimizerArtifactBuffConfigs } from "@Backend";
import type { ArtifactManager } from "../../utils/artifact-manager/artifact-manager";

import { GenshinModifierView } from "@Src/components";
import { getArtifactDescription } from "@Src/components/modifier-list/modifiers.utils";
import Array_ from "@Src/utils/array-utils";

interface ArtifactModConfigProps {
  manager: ArtifactManager;
}
export function ArtifactModConfig({ manager }: ArtifactModConfigProps) {
  const [configs, setConfigs] = useState<OptimizerArtifactBuffConfigs>(manager.buffConfigs);

  return (
    <div className="h-full flex flex-col">
      <p>Artifact buffs to be activated (if any)</p>

      <div className="mt-2 grow custom-scrollbar space-y-2">
        {manager.sets.map(({ data }) => {
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

                    setConfigs(manager.changeBuffConfigInputs(data.code, configIndex, newInputs));
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
                      setConfigs(manager.toggleBuffConfig(data.code, configIndex));
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
      </div>
    </div>
  );
}
