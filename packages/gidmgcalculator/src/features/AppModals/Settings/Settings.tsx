import { useContext, useRef, useState } from "react";
import { Modal } from "rond";

import { LEVELS } from "@Src/constants";
import { $AppSettings } from "@Src/services";
import { applySettings } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { DynamicStoreControlContext } from "../../DynamicStoreProvider";
import { CheckSetting, Section, SelectSetting } from "./settings-components";

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

  const defaultValueSettings = useRef([
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
  ] as const);

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
            setTempSettings((prevSettings) => ({
              ...prevSettings,
              charInfoIsSeparated: !prevSettings.charInfoIsSeparated,
            }));
          }}
        />
        <CheckSetting
          label="Keep artifact stats when switching to a new set"
          defaultChecked={tempSettings.doKeepArtStatsOnSwitch}
          onChange={() => {
            setTempSettings((prevSettings) => ({
              ...prevSettings,
              doKeepArtStatsOnSwitch: !prevSettings.doKeepArtStatsOnSwitch,
            }));
          }}
        />
        <div>
          <CheckSetting
            label="Auto save my database to browser's local storage"
            defaultChecked={tempSettings.persistingUserData}
            onChange={() => {
              setTempSettings((prevSettings) => ({
                ...prevSettings,
                persistingUserData: !prevSettings.persistingUserData,
              }));
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
        {defaultValueSettings.current.map(({ key, ...rest }) => {
          return (
            <SelectSetting
              key={key}
              defaultValue={tempSettings[key]}
              onChange={(newvalue) => {
                setTempSettings((prevSettings) => ({
                  ...prevSettings,
                  [key]: newvalue,
                }));
              }}
              {...rest}
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
