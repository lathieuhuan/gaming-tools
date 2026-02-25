import { useScreenWatcher } from "rond";

import { AppSettingsState } from "@Store/settings";
import { SettingsGroup, SettingsGroupItem } from "./SettingsGroup";
import { OnSettingChange } from "./types";

type CalculatorSettingsProps = {
  initialValues: AppSettingsState;
  onChange?: OnSettingChange<
    "separateCharInfo" | "keepArtStatsOnSwitch" | "isTabLayout" | "askBeforeUnload"
  >;
};

export function CalculatorSettings({ initialValues, onChange }: CalculatorSettingsProps) {
  const screenWatcher = useScreenWatcher();

  const items: SettingsGroupItem[] = [
    {
      key: "separateCharInfo",
      label: "Separate main character's info on each setup",
      type: "CHECK",
      controlProps: {
        defaultChecked: initialValues.separateCharInfo,
        onChange: (value) => onChange?.("separateCharInfo", value),
      },
    },
    {
      key: "keepArtStatsOnSwitch",
      label: "Keep artifact stats when switching to a new set",
      type: "CHECK",
      controlProps: {
        defaultChecked: initialValues.keepArtStatsOnSwitch,
        onChange: (value) => onChange?.("keepArtStatsOnSwitch", value),
      },
    },
    {
      key: "isTabLayout",
      label: "Use tab layout (mobile only)",
      type: "CHECK",
      hidden: screenWatcher.isFromSize("sm"),
      controlProps: {
        defaultChecked: initialValues.isTabLayout,
        onChange: (value) => onChange?.("isTabLayout", value),
      },
    },
    {
      key: "askBeforeUnload",
      label: "Confirm before leaving the site",
      type: "CHECK",
      controlProps: {
        defaultChecked: initialValues.askBeforeUnload,
        onChange: (value) => onChange?.("askBeforeUnload", value),
      },
    },
  ];

  return <SettingsGroup title="Calculator" items={items} />;
}
