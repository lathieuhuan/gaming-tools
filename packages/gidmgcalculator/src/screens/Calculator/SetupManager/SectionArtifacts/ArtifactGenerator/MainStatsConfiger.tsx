import { useMemo, useState } from "react";
import { FaUndoAlt } from "react-icons/fa";
import { Button, CheckboxGroup, CheckboxGroupProps, clsx, CollapseSpace, TrashCanSvg } from "rond";

import type { ArtifactType, AttributeStat } from "@/types";

import { useTranslation } from "@/hooks";
import { ArtifactState } from "@/models";
import { useGeneratorStore } from "./store";

type ConfigurableAtfTypes = "sands" | "goblet" | "circlet";

export function MainStatsConfiger() {
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState<ArtifactType[]>([]);

  const mainStatTypes = useGeneratorStore((state) => state.mainStatTypes);

  const getOptions = (type: ArtifactType) => {
    return ArtifactState.allMainStatTypesOf(type).map((statType) => {
      return { value: statType };
    });
  };

  const { optionGroups, renderLabel } = useMemo(() => {
    const configurableTypes: ConfigurableAtfTypes[] = ["sands", "goblet", "circlet"];

    const optionGroups = configurableTypes.map((atfType) => ({
      key: atfType,
      options: getOptions(atfType),
    }));

    const renderLabel: CheckboxGroupProps<AttributeStat>["renderLabel"] = (props, option) => {
      return (
        <button
          className={clsx(
            "px-2 h-6 flex-center rounded-full text-sm font-medium border border-dark-line",
            props.checked ? "bg-light-4 text-black" : ""
          )}
          onClick={props.onClick}
        >
          {t(option.value)}
        </button>
      );
    };

    return { optionGroups, renderLabel };
  }, []);

  const handleToggleGroup = (key: ArtifactType, newActive: boolean) => {
    setActiveKeys(newActive ? [...activeKeys, key] : activeKeys.filter((k) => k !== key));
  };

  const handleChange = (atfType: ConfigurableAtfTypes, statTypes: Set<AttributeStat>) => {
    useGeneratorStore.setState((state) => {
      state.mainStatTypes[atfType] = [...statTypes];
    });
  };

  const handleRemove = (atfType: ConfigurableAtfTypes) => {
    useGeneratorStore.setState((state) => {
      state.mainStatTypes[atfType] = [];
    });
  };

  // const icon

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase text-light-hint">Main Stats</p>

      <div className="space-y-3">
        {optionGroups.map((group) => {
          const active = activeKeys.includes(group.key);

          return (
            <div key={group.key}>
              <div
                className={clsx(
                  "rounded-sm bg-gradient-to-r to-transparent grow flex items-center glow-on-hover",
                  active
                    ? "text-black font-medium from-primary-2 via-primary-2"
                    : "text-light-1 from-dark-2 via-dark-2"
                )}
              >
                <button
                  className="px-2 py-1 h-8 grow text-left"
                  onClick={() => handleToggleGroup(group.key, !active)}
                >
                  <span className="text-base leading-5">
                    {t(group.key)} ({mainStatTypes[group.key].length || group.options.length})
                  </span>
                </button>

                <div className="pr-2 flex gap-1">
                  <Button boneOnly icon={<FaUndoAlt />} />
                  <Button
                    boneOnly
                    icon={<TrashCanSvg />}
                    disabled={mainStatTypes[group.key].length === 0}
                    onClick={() => handleRemove(group.key)}
                  />
                </div>
              </div>

              <CollapseSpace active={active}>
                <div className="pt-3 pb-2">
                  <CheckboxGroup
                    className="flex flex-wrap items-center gap-2"
                    options={group.options}
                    renderLabel={renderLabel}
                    values={mainStatTypes[group.key]}
                    onChange={(values) => handleChange(group.key, values)}
                  />
                </div>
              </CollapseSpace>
            </div>
          );
        })}
      </div>
    </div>
  );
}
