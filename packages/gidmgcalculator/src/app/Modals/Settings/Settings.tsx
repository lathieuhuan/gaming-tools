import { useRef } from "react";
import { Modal } from "rond";

import { SCREEN_PATH } from "@/constants";
import { $AppCharacter, $AppSettings, AppSettings } from "@/services";
import { useDynamicStoreControl, useStore } from "@/systems/dynamic-store";
import { useRouter } from "@/systems/router";
import { AccountIngame } from "@Store/account-slice/types";
import { applySettings } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

import { AccountSettingsControls } from "./AccountSettingsControls";
import { AppSettingsControls } from "./AppSettingsControls";

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
  const router = useRouter();
  const store = useStore();
  const newAppSettings = useAppSettings();
  const newAccountSettings = useRef(store.select((state) => state.account.ingame));

  const updateAppStoreConfig = useDynamicStoreControl();

  const handleSubmit = () => {
    const currSettings = $AppSettings.get();
    const changeTraveler = newAppSettings.traveler !== currSettings.traveler;

    if (changeTraveler) {
      $AppCharacter.changeTraveler(newAppSettings.traveler);
      router.navigate(SCREEN_PATH.CALCULATOR);

      dispatch(updateUI({ traveler: newAppSettings.traveler }));
    }
    dispatch(
      applySettings({
        mergeCharInfo: !currSettings.isCharInfoSeparated && newAppSettings.isCharInfoSeparated,
        changeTraveler,
      })
    );
    if (newAppSettings.isTabLayout !== currSettings.isTabLayout) {
      dispatch(
        updateUI({
          isTabLayout: newAppSettings.isTabLayout,
        })
      );
    }
    if (newAppSettings.persistingUserData !== currSettings.persistingUserData) {
      updateAppStoreConfig({
        persistingUserData: newAppSettings.persistingUserData,
      });
    }

    $AppSettings.set(newAppSettings);
    onClose();
  };

  const handleAppSettingChange = <TKey extends keyof AppSettings>(key: TKey, value: AppSettings[TKey]) => {
    newAppSettings[key] = value;
  };

  const handleAccountSettingChange = (values: AccountIngame) => {
    newAccountSettings.current = values;
  };

  return (
    <form
      id="app-settings-form"
      className="h-full overflow-auto space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <AccountSettingsControls initialValues={newAccountSettings.current} onChange={handleAccountSettingChange} />
      <AppSettingsControls initialValues={newAppSettings} onChange={handleAppSettingChange} />
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
