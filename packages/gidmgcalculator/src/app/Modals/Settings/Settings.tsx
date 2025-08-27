import { Level, LEVELS } from "@Calculation";
import { useRef, useState } from "react";
import { Checkbox, InputNumber, Modal, useScreenWatcher, VersatileSelect } from "rond";

import type { Traveler } from "@Src/types";
import type { SettingGroupRender } from "./types";

import { CharacterPortrait } from "@Src/components";
import { MAX_TARGET_LEVEL } from "@Src/constants";
import { useDynamicStoreControl } from "@Src/features";
import { $AppCharacter, $AppSettings, AppSettings } from "@Src/services";
import { genNumberSequence } from "@Src/utils/pure-utils";
import { applySettings } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

const useAppSettings = () => {
  const settings = useRef<AppSettings>();

  if (!settings.current) {
    settings.current = $AppSettings.get();
  }
  return settings.current;
};

type SettingsProps = {
  onClose: () => void;
};

const SettingsCore = ({ onClose }: SettingsProps) => {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const newSettings = useAppSettings();
  const updateAppStoreConfig = useDynamicStoreControl();

  const groupCls = "px-4 py-2 bg-surface-1 rounded";
  const titleCls = "text-secondary-1 text-lg font-semibold";

  const onConfirmNewSettings = () => {
    const currSettings = $AppSettings.get();
    const changeTraveler = newSettings.traveler !== currSettings.traveler;

    if (changeTraveler) {
      $AppCharacter.changeTraveler(newSettings.traveler);

      dispatch(
        updateUI({
          atScreen: "CALCULATOR",
          traveler: newSettings.traveler,
        })
      );
    }
    dispatch(
      applySettings({
        mergeCharInfo: !currSettings.isCharInfoSeparated && newSettings.isCharInfoSeparated,
        changeTraveler,
      })
    );
    if (newSettings.isTabLayout !== currSettings.isTabLayout) {
      dispatch(
        updateUI({
          isTabLayout: newSettings.isTabLayout,
        })
      );
    }
    if (newSettings.persistingUserData !== currSettings.persistingUserData) {
      updateAppStoreConfig({
        persistingUserData: newSettings.persistingUserData,
      });
    }

    $AppSettings.set(newSettings);
    onClose();
  };

  const groupRenders = useRef<SettingGroupRender[]>([
    {
      title: "Calculator",
      items: [
        {
          key: "isCharInfoSeparated",
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
          options: genNumberSequence(7, 0),
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
    newSettings[key] = value;
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
      <div className={`${groupCls} flex justify-between`}>
        <p className={titleCls}>Traveler</p>
        <TravelerSelect
          defaultValue={newSettings.traveler}
          onChange={(value) => changeTempSettings("traveler", value)}
        />
      </div>

      {groupRenders.current.map((group, groupIndex) => {
        return (
          <div key={groupIndex} className={groupCls}>
            <p className={titleCls}>{group.title}</p>
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
                          defaultChecked={newSettings[item.key]}
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
                            defaultValue={newSettings[item.key]}
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
                            defaultValue={newSettings[item.key]}
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

function TravelerSelect(props: { defaultValue: Traveler; onChange: (value: Traveler) => void }) {
  const [selected, setSelected] = useState(props.defaultValue);
  const travelers: Traveler[] = ["LUMINE", "AETHER"];

  return (
    <div className="py-2 flex gap-3">
      {travelers.map((traveler) => {
        const info = $AppCharacter.getTravelerProps(traveler);
        const isSelected = traveler === selected;
        return (
          <CharacterPortrait
            key={traveler}
            info={info}
            className={isSelected ? "shadow-3px-3px shadow-active-color" : ""}
            size="small"
            zoomable={false}
            onClick={() => {
              if (!isSelected) {
                setSelected(traveler);
                props.onChange(traveler);
              }
            }}
          />
        );
      })}
    </div>
  );
}

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
