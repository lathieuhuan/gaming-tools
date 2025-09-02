import { clsx, useScreenWatcher } from "rond";

import { MAX_TARGET_LEVEL } from "@/constants";
import { AppSettings } from "@/services";
import { genSequentialOptions } from "@/utils";
import { Level, LEVELS } from "@Calculation";

import { SettingsGroup, SettingsGroupProps } from "../SettingsGroup";

type AppSettingsControlsProps = {
  className?: string;
  initialValues: AppSettings;
  onChange: <TKey extends keyof AppSettings>(key: TKey, value: AppSettings[TKey]) => void;
};

export function AppSettingsControls({ className, initialValues, onChange }: AppSettingsControlsProps) {
  const screenWatcher = useScreenWatcher();

  const levelOptions = LEVELS.map((_, i) => {
    const value = LEVELS[LEVELS.length - 1 - i];
    return { label: value, value };
  });

  const artLevelOptions = [...Array(6)].map((_, i) => {
    const value = i * 4;
    return { label: value, value };
  });

  const groups: SettingsGroupProps[] = [
    {
      title: "Calculator",
      items: [
        {
          key: "separateCharInfo",
          label: "Separate main character's info on each setup",
          type: "CHECK",
          defaultValue: initialValues.separateCharInfo,
          onChange: (value: boolean) => onChange("separateCharInfo", value),
        },
        {
          key: "keepArtStatsOnSwitch",
          label: "Keep artifact stats when switching to a new set",
          type: "CHECK",
          defaultValue: initialValues.keepArtStatsOnSwitch,
          onChange: (value: boolean) => onChange("keepArtStatsOnSwitch", value),
        },
        {
          key: "isTabLayout",
          label: "Use tab layout (mobile only)",
          type: "CHECK",
          hidden: screenWatcher.isFromSize("sm"),
          defaultValue: initialValues.isTabLayout,
          onChange: (value: boolean) => onChange("isTabLayout", value),
        },
        {
          key: "askBeforeUnload",
          label: "Confirm before leaving the site",
          type: "CHECK",
          defaultValue: initialValues.askBeforeUnload,
          onChange: (value: boolean) => onChange("askBeforeUnload", value),
        },
      ],
    },
    {
      title: "User Data",
      items: [
        {
          key: "persistUserData",
          label: "Auto save my database to browser's local storage",
          description: [
            "Your data is available on this browser only and will be lost if the local storage is cleared. Does not work as expected in Incognito mode.",
          ],
          type: "CHECK",
          defaultValue: initialValues.persistUserData,
          onChange: (value: boolean) => onChange("persistUserData", value),
        },
      ],
    },
    {
      title: "Default values",
      items: [
        {
          key: "charLevel",
          label: "Character level",
          options: levelOptions,
          type: "SELECT",
          defaultValue: initialValues.charLevel,
          onChange: (value: Level) => onChange("charLevel", value),
        },
        {
          key: "charCons",
          label: "Character constellation",
          options: genSequentialOptions(7, 0),
          type: "SELECT",
          defaultValue: initialValues.charCons,
          onChange: (value: number) => onChange("charCons", value),
        },
        {
          key: "charNAs",
          label: "Character Normal Attack level",
          options: genSequentialOptions(10),
          type: "SELECT",
          defaultValue: initialValues.charNAs,
          onChange: (value: number) => onChange("charNAs", value),
        },
        {
          key: "charES",
          label: "Character Elemental Skill level",
          options: genSequentialOptions(10),
          type: "SELECT",
          defaultValue: initialValues.charES,
          onChange: (value: number) => onChange("charES", value),
        },
        {
          key: "charEB",
          label: "Character Elemental Burst level",
          options: genSequentialOptions(10),
          type: "SELECT",
          defaultValue: initialValues.charEB,
          onChange: (value: number) => onChange("charEB", value),
        },
        {
          key: "wpLevel",
          label: "Weapon level",
          options: levelOptions,
          type: "SELECT",
          defaultValue: initialValues.wpLevel,
          onChange: (value: Level) => onChange("wpLevel", value),
        },
        {
          key: "wpRefi",
          label: "Weapon refinement",
          options: genSequentialOptions(5),
          type: "SELECT",
          defaultValue: initialValues.wpRefi,
          onChange: (value: number) => onChange("wpRefi", value),
        },
        {
          key: "artLevel",
          label: "Artifact level",
          options: artLevelOptions,
          type: "SELECT",
          defaultValue: initialValues.artLevel,
          onChange: (value: number) => onChange("artLevel", value),
        },
        {
          key: "targetLevel",
          label: "Target level",
          type: "INPUT",
          max: MAX_TARGET_LEVEL,
          defaultValue: initialValues.targetLevel,
          onChange: (value: number) => onChange("targetLevel", value),
        },
      ],
    },
  ];

  return (
    <div className={clsx("space-y-2", className)}>
      {groups.map((group, groupIndex) => {
        return <SettingsGroup key={groupIndex} title={group.title} items={group.items} />;
      })}
    </div>
  );
}
