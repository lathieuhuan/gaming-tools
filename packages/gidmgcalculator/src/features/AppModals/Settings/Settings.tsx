import { useContext, useRef, useState } from "react";
import { InputNumber, Modal, Select } from "rond";

import type { Level } from "@Src/types";
import { LEVELS } from "@Src/constants";
import { $AppSettings, AppSettings } from "@Src/services";
import { applySettings } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { DynamicStoreControlContext } from "../../DynamicStoreProvider";
import { CheckSetting, Section } from "./settings-components";

type DefaultValueControl = {
  key: Exclude<keyof AppSettings, "charInfoIsSeparated" | "doKeepArtStatsOnSwitch" | "persistingUserData">;
  label: string;
  options?: (string | number)[];
};

const genNumberSequence = (count: number, startFromZero?: boolean) => {
  return [...Array(count)].map((_, i) => i + (startFromZero ? 0 : 1));
};

interface SettingsProps {
  onClose: () => void;
}
const SettingsCore = ({ onClose }: SettingsProps) => {
  const dispatch = useDispatch();
  const [tempSettings, setTempSettings] = useState($AppSettings.get());
  const changeAppStoreConfig = useContext(DynamicStoreControlContext);

  const onConfirmNewSettings = () => {
    const { charInfoIsSeparated, persistingUserData } = $AppSettings.get();

    if (!tempSettings.charInfoIsSeparated && charInfoIsSeparated) {
      dispatch(
        applySettings({
          doMergeCharInfo: true,
        })
      );
    }

    if (tempSettings.persistingUserData !== persistingUserData) {
      changeAppStoreConfig({
        persistingUserData: !persistingUserData,
      });
    }

    $AppSettings.set(tempSettings);
    onClose();
  };

  const defaultValueSettings = useRef<DefaultValueControl[]>([
    {
      key: "charLevel",
      label: "Character level",
      options: LEVELS.map((_, i) => LEVELS[LEVELS.length - 1 - i]),
    },
    {
      key: "charCons",
      label: "Character constellation",
      options: genNumberSequence(7, true),
    },
    {
      key: "charNAs",
      label: "Character Normal Attack level",
      options: genNumberSequence(10),
    },
    {
      key: "charES",
      label: "Character Elemental Skill level",
      options: genNumberSequence(10),
    },
    {
      key: "charEB",
      label: "Character Elemental Burst level",
      options: genNumberSequence(10),
    },
    {
      key: "wpLevel",
      label: "Weapon level",
      options: LEVELS.map((_, i) => LEVELS[LEVELS.length - 1 - i]),
    },
    { key: "wpRefi", label: "Weapon refinement", options: genNumberSequence(5) },
    {
      key: "artLevel",
      label: "Artifact level",
      options: [...Array(6)].map((_, i) => i * 4),
    },
    {
      key: "targetLevel",
      label: "Target level",
    },
  ]);

  const onChangeTempSettings = (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
    setTempSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const renderDefaultSetting = (key: string, label: string, control: React.ReactNode) => {
    return (
      <div key={key} className="flex gap-3 items-center justify-between" style={{ minHeight: "2.25rem" }}>
        <span>{label}</span>
        <div className="w-20">{control}</div>
      </div>
    );
  };

  return (
    <form
      id="app-settings-form"
      className="h-full hide-scrollbar space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmNewSettings();
      }}
    >
      <Section title="Calculator">
        <CheckSetting
          label="Separate main character's info on each setup"
          defaultChecked={tempSettings.charInfoIsSeparated}
          onChange={() => {
            onChangeTempSettings("charInfoIsSeparated", !tempSettings.charInfoIsSeparated);
          }}
        />
        <CheckSetting
          label="Keep artifact stats when switching to a new set"
          defaultChecked={tempSettings.doKeepArtStatsOnSwitch}
          onChange={() => {
            onChangeTempSettings("doKeepArtStatsOnSwitch", !tempSettings.doKeepArtStatsOnSwitch);
          }}
        />
        <div>
          <CheckSetting
            label="Auto save my database to browser's local storage"
            defaultChecked={tempSettings.persistingUserData}
            onChange={() => {
              onChangeTempSettings("persistingUserData", !tempSettings.persistingUserData);
            }}
          />
          <ul className="mt-1 pl-4 text-sm list-disc space-y-1">
            {tempSettings.persistingUserData && (
              <li>Your data is available on this browser only and will be lost if the local storage is cleared.</li>
            )}
            <li className="text-danger-3">Change of this setting can remove your current data and works on the App!</li>
          </ul>
        </div>
      </Section>

      <Section title="Default values">
        {defaultValueSettings.current.map(({ key, label, options }) => {
          const defaultValue = tempSettings[key];

          if (options) {
            return renderDefaultSetting(
              key,
              label,
              <Select
                className="font-medium"
                dropdownCls="font-medium"
                align="right"
                defaultValue={defaultValue}
                getPopupContainer={() => document.getElementById("app-settings-form")!}
                options={options.map((option) => ({ label: option, value: option }))}
                onChange={(value) => {
                  const newValue = typeof defaultValue === "string" ? (value as Level) : +value;
                  onChangeTempSettings(key, newValue);
                }}
              />
            );
          }

          return renderDefaultSetting(
            key,
            label,
            <InputNumber
              key={key}
              className="w-full font-semibold"
              size="medium"
              value={tempSettings.targetLevel}
              max={100}
              onChange={(newValue) => {
                onChangeTempSettings(key, newValue);
              }}
            />
          );
        })}
      </Section>
    </form>
  );
};

export const Settings = Modal.wrap(SettingsCore, {
  title: "Settings",
  className: ["w-96 bg-surface-2", Modal.LARGE_HEIGHT_CLS],
  bodyCls: "py-0",
  withHeaderDivider: false,
  withFooterDivider: false,
  withActions: true,
  formId: "app-settings-form",
});
