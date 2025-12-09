import { ModifierView } from "rond";

import type { ModInputConfig } from "@/types";
import type { ModifierViewInputConfig, ModifierViewProps } from "rond";

import { genSequentialOptions } from "@/utils";

const genOptions = (config: ModInputConfig) => {
  let count: number | undefined = undefined;

  if (config.max) {
    count = config.init === 0 ? config.max + 1 : config.max;
  }

  return genSequentialOptions(count, config.init === 0 ? 0 : 1);
};

export type GenshinModifierViewProps = Omit<ModifierViewProps, "inputConfigs"> & {
  inputConfigs?: ModInputConfig[];
  isTeamMod?: boolean;
};

export function GenshinModifierView({
  inputConfigs,
  isTeamMod,
  ...viewProps
}: GenshinModifierViewProps) {
  if (isTeamMod) {
    return <ModifierView {...viewProps} mutable={false} headingVariant="custom" />;
  }

  const viewInputConfigs = inputConfigs?.map<ModifierViewInputConfig>((config) => {
    const label = config.label || "[missing label]";

    switch (config.type) {
      case "TEXT":
        return { type: "text", label, max: config.max };
      case "LEVEL":
        return { type: "text", label, max: 13 };
      case "CHECK":
        return { type: "check", label };
      case "SELECT": {
        if (config.options) {
          return {
            type: "select",
            label,
            options: config.options.map((option, optionIndex) => ({
              label: option,
              value: optionIndex,
            })),
            style: { maxWidth: "7rem" },
          };
        }

        return { type: "select", label, options: genOptions(config) };
      }
      case "STACKS":
        return {
          type: "select",
          label: config.label || "Stacks",
          style: { maxWidth: "3.25rem" },
          options: genOptions(config),
        };
      case "ANEMOABLE":
        return {
          type: "select",
          label,
          options: [
            { label: "Pyro", value: 0 },
            { label: "Hydro", value: 1 },
            { label: "Electro", value: 2 },
            { label: "Cryo", value: 3 },
          ],
        };
      case "DENDROABLE":
        return {
          type: "select",
          label,
          options: [
            { label: "Pyro", value: 0 },
            { label: "Hydro", value: 1 },
            { label: "Electro", value: 2 },
          ],
        };
      case "ELEMENTAL": {
        const options = [
          { label: "Pyro", value: 0 },
          { label: "Hydro", value: 1 },
          { label: "Electro", value: 2 },
          { label: "Cryo", value: 3 },
          { label: "Geo", value: 4 },
          { label: "Anemo", value: 5 },
          { label: "Dendro", value: 6 },
        ];

        return {
          type: "select",
          label,
          options: config.options
            ? options.filter((option) => config.options?.includes(option.value))
            : options,
          style: { maxWidth: config.options ? "6rem" : undefined },
        };
      }
      default:
        return {
          label: "[unmatched type]",
          type: "text",
        };
    }
  });

  return <ModifierView {...viewProps} inputConfigs={viewInputConfigs} />;
}
