import { useContext, useRef } from "react";
import { Checkbox, InputNumber, Modal, VersatileSelect, useScreenWatcher } from "rond";
import { Level, LEVELS } from "@Backend";

import { $AppSettings, AppSettings } from "@Src/services";
import { MAX_TARGET_LEVEL } from "@Src/constants";
import { applySettings } from "@Store/calculator-slice";
import { updateUI } from "@Store/ui-slice";
import { useDispatch } from "@Store/hooks";
import { DynamicStoreControlContext } from "../../DynamicStoreProvider";

type SettingKey<T extends keyof AppSettings> = Extract<keyof AppSettings, T>;

type SettingItemRenderCheck = {
  type: "CHECK";
  key: SettingKey<
    "charInfoIsSeparated" | "doKeepArtStatsOnSwitch" | "isTabLayout" | "askBeforeUnload" | "persistingUserData"
  >;
};
type SettingItemRenderSelect = {
  type: "SELECT";
  key: SettingKey<
    "traveler" | "charLevel" | "charCons" | "charNAs" | "charES" | "charEB" | "wpLevel" | "wpRefi" | "artLevel"
  >;
  options: (string | number)[];
};
type SettingItemRenderInput = {
  type: "INPUT";
  key: SettingKey<"targetLevel">;
  max?: number;
};

type SettingItemRender = (SettingItemRenderSelect | SettingItemRenderInput | SettingItemRenderCheck) & {
  label: string;
  description?: string[];
  isHidden?: boolean;
};

type SettingGroupRender = {
  title: string;
  items: SettingItemRender[];
};

const genNumberSequence = (count: number, startFromZero?: boolean) => {
  return [...Array(count)].map((_, i) => i + (startFromZero ? 0 : 1));
};

const useAppSettings = () => {
  const tempSettings = useRef<AppSettings>();

  if (!tempSettings.current) {
    tempSettings.current = $AppSettings.get();
  }
  return tempSettings.current;
};

interface SettingsProps {
  onClose: () => void;
}
const SettingsCore = ({ onClose }: SettingsProps) => {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const tempSettings = useAppSettings();
  const changeAppStoreConfig = useContext(DynamicStoreControlContext);

  // const travelers: AppSettings["traveler"][] = ["LUMINE", "AETHER"];

  const onConfirmNewSettings = () => {
    const currSettings = $AppSettings.get();

    dispatch(
      applySettings({
        mergeCharInfo: !tempSettings.charInfoIsSeparated && currSettings.charInfoIsSeparated,
      })
    );
    if (tempSettings.isTabLayout !== currSettings.isTabLayout) {
      dispatch(
        updateUI({
          isTabLayout: tempSettings.isTabLayout,
        })
      );
    }
    if (tempSettings.traveler !== currSettings.traveler) {
      //
    }
    if (tempSettings.persistingUserData !== currSettings.persistingUserData) {
      changeAppStoreConfig({
        persistingUserData: tempSettings.persistingUserData,
      });
    }

    $AppSettings.set(tempSettings);
    onClose();
  };

  const groupRenders = useRef<SettingGroupRender[]>([
    {
      title: "Traveler",
      items: [
        {
          key: "traveler",
          label: "Select the Traveler",
          options: ["LUMINE", "AETHER"],
          type: "SELECT",
        },
      ],
    },
    {
      title: "Calculator",
      items: [
        {
          key: "charInfoIsSeparated",
          label: "Separate main character's info on each setup",
          type: "CHECK",
        },
        {
          key: "doKeepArtStatsOnSwitch",
          label: "Keep artifact stats when switching to a new set",
          type: "CHECK",
        },
        {
          key: "isTabLayout",
          label: "Use tab layout (mobile only)",
          type: "CHECK",
          isHidden: screenWatcher.isFromSize("sm"),
        },
        {
          key: "askBeforeUnload",
          label: "Confirm before leaving the site",
          type: "CHECK",
        },
      ],
    },
    {
      title: "User Data",
      items: [
        {
          key: "persistingUserData",
          label: "Auto save my database to browser's local storage",
          description: [
            "Your data is available on this browser only and will be lost if the local storage is cleared. Does not work as expected in Incognito mode.",
          ],
          type: "CHECK",
        },
      ],
    },
    {
      title: "Default values",
      items: [
        {
          key: "charLevel",
          label: "Character level",
          options: LEVELS.map((_, i) => LEVELS[LEVELS.length - 1 - i]),
          type: "SELECT",
        },
        {
          key: "charCons",
          label: "Character constellation",
          options: genNumberSequence(7, true),
          type: "SELECT",
        },
        {
          key: "charNAs",
          label: "Character Normal Attack level",
          options: genNumberSequence(10),
          type: "SELECT",
        },
        {
          key: "charES",
          label: "Character Elemental Skill level",
          options: genNumberSequence(10),
          type: "SELECT",
        },
        {
          key: "charEB",
          label: "Character Elemental Burst level",
          options: genNumberSequence(10),
          type: "SELECT",
        },
        {
          key: "wpLevel",
          label: "Weapon level",
          options: LEVELS.map((_, i) => LEVELS[LEVELS.length - 1 - i]),
          type: "SELECT",
        },
        {
          key: "wpRefi",
          label: "Weapon refinement",
          options: genNumberSequence(5),
          type: "SELECT",
        },
        {
          key: "artLevel",
          label: "Artifact level",
          options: [...Array(6)].map((_, i) => i * 4),
          type: "SELECT",
        },
        {
          key: "targetLevel",
          label: "Target level",
          type: "INPUT",
          max: MAX_TARGET_LEVEL,
        },
      ],
    },
  ]);

  const changeTempSettings = <TKey extends keyof AppSettings>(key: TKey, value: AppSettings[TKey]) => {
    tempSettings[key] = value;
  };

  return (
    <form
      id="app-settings-form"
      className="h-full overflow-auto space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmNewSettings();
      }}
    >
      {/* <div className="px-4 py-2 bg-surface-1 rounded">
        <p className="text-secondary-1 text-lg font-semibold">Traveler</p>

        <div>
          {travelers.map((traveler) => {
            return <div key={traveler}>{traveler}</div>;
          })}
        </div>
      </div> */}

      {groupRenders.current.map((group, groupIndex) => {
        return (
          <div key={groupIndex} className="px-4 py-2 bg-surface-1 rounded">
            <p className="text-secondary-1 text-lg font-semibold">{group.title}</p>
            <div className="mt-2 space-y-3">
              {group.items.map((item) => {
                if (item.isHidden) {
                  return null;
                }
                let control: React.ReactNode = null;

                switch (item.type) {
                  case "CHECK":
                    control = (
                      <label className="flex items-center justify-between glow-on-hover">
                        <span>{item.label}</span>
                        <Checkbox
                          className="ml-4"
                          defaultChecked={tempSettings[item.key]}
                          onChange={(checked) => {
                            changeTempSettings(item.key, checked);
                          }}
                        />
                      </label>
                    );
                    break;
                  case "SELECT":
                    control = (
                      <div className="flex gap-3 items-center justify-between" style={{ minHeight: "2.25rem" }}>
                        <span>{item.label}</span>
                        <div className="w-20 flex shrink-0">
                          <VersatileSelect
                            title="Select Default Value"
                            className="font-semibold h-8"
                            dropdownCls="font-medium"
                            align="right"
                            defaultValue={tempSettings[item.key]}
                            options={item.options.map((option) => ({ label: option, value: option }))}
                            onChange={(value) => {
                              const newValue = typeof value === "string" ? (value as Level) : +value;
                              changeTempSettings(item.key, newValue);
                            }}
                          />
                        </div>
                      </div>
                    );
                    break;
                  case "INPUT":
                    control = (
                      <div className="flex gap-3 items-center justify-between" style={{ minHeight: "2.25rem" }}>
                        <span>{item.label}</span>
                        <div className="w-20 flex shrink-0">
                          <InputNumber
                            className="w-full font-semibold"
                            size="medium"
                            defaultValue={tempSettings[item.key]}
                            max={item.max}
                            onChange={(newValue) => {
                              changeTempSettings(item.key, newValue);
                            }}
                          />
                        </div>
                      </div>
                    );
                    break;
                }
                return (
                  <div key={item.key}>
                    {control}
                    {item.description ? (
                      <ul className="mt-1 pl-4 text-sm list-disc space-y-1">
                        {item.description.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </form>
  );
};

export const Settings = Modal.wrap(SettingsCore, {
  title: "Settings",
  className: ["bg-surface-2", Modal.LARGE_HEIGHT_CLS],
  style: {
    width: 412,
  },
  bodyCls: "py-0",
  withHeaderDivider: false,
  withFooterDivider: false,
  withActions: true,
  formId: "app-settings-form",
});
