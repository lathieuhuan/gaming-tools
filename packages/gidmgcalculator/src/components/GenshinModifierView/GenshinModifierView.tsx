import { ModifierView, type ModifierViewProps, type ModifierViewInputConfig } from "rond";
import { ModInputConfig } from "@Backend";
import { genSequentialOptions } from "@Src/utils";

export interface GenshinModifierViewProps extends Omit<ModifierViewProps, "inputConfigs"> {
  inputConfigs?: ModInputConfig[];
}
export function GenshinModifierView({ inputConfigs, ...viewProps }: GenshinModifierViewProps) {
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
        return { type: "select", label, options: genSequentialOptions(config.max, config.initialValue === 0) };
      }
      case "STACKS":
        return {
          type: "select",
          label: "Stacks",
          options: genSequentialOptions(config.max, config.initialValue === 0),
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
      default:
        return {
          label: "[unmatched type]",
          type: "text",
        };
    }
  });

  return <ModifierView {...viewProps} inputConfigs={viewInputConfigs} />;
}
