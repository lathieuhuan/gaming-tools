import { useState } from "react";
import { FaBars, FaCog, FaDonate, FaDownload, FaInfoCircle, FaQuestionCircle, FaUpload } from "react-icons/fa";
import { Button, clsx, LoadingSpin, Popover, useClickOutside } from "rond";

import { IS_DEV_ENV } from "@Src/constants";
import { $AppData } from "@Src/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectIsReadyApp, updateUI, type AppScreen, type UIState } from "@Store/ui-slice";

// Components
import { NavTabs, type NavTabsProps } from "./NavTabs";
import { QuickButtons } from "./QuickButtons";

const buttonCls = "w-8 h-8 flex-center";

type OptionProps = {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  modalType: UIState["appModalType"];
};

export function NavBar() {
  const dispatch = useDispatch();
  const isReadyApp = useSelector(selectIsReadyApp);
  const [menuDropped, setMenuDropped] = useState(false);
  const [refetching, setRefetching] = useState(false);

  const closeMenu = () => setMenuDropped(false);

  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  const screens: NavTabsProps["screens"] = [
    { label: "My Characters", value: "MY_CHARACTERS" },
    { label: "My Weapons", value: "MY_WEAPONS" },
    { label: "My Artifacts", value: "MY_ARTIFACTS" },
    { label: "My Setups", value: "MY_SETUPS" },
    { label: "Calculator", value: "CALCULATOR" },
  ];

  const option = {
    INTRO: {
      label: "Introduction",
      icon: <FaInfoCircle size="1.125rem" />,
      modalType: "INTRO",
    },
    GUIDE: {
      label: "Guides",
      icon: <FaQuestionCircle />,
      modalType: "GUIDES",
    },
    SETTINGS: {
      label: "Settings",
      icon: <FaCog />,
      modalType: "SETTINGS",
      disabled: !isReadyApp,
    },
    DOWNLOAD: {
      label: "Download",
      icon: <FaDownload />,
      modalType: "DOWNLOAD",
      disabled: !isReadyApp,
    },
    UPLOAD: {
      label: "Upload",
      icon: <FaUpload />,
      modalType: "UPLOAD",
      disabled: !isReadyApp,
    },
  } satisfies Record<string, OptionProps>;

  const openModal = (type: UIState["appModalType"]) => () => {
    dispatch(updateUI({ appModalType: type }));
    closeMenu();
  };

  const onClickTab = (tab: AppScreen) => {
    dispatch(updateUI({ atScreen: tab }));
  };

  const onClickRefetch = async () => {
    setRefetching(true);

    const response = await $AppData.fetchMetadata();

    if (response.data) {
      $AppData.data = response.data;
      alert(`Refetched version: ${response.data.version}`);
    } else {
      alert(`Refetching has failed!`);
    }

    setRefetching(false);
  };

  const renderOption = ({ label, icon, modalType, disabled }: OptionProps) => {
    return (
      <button
        className={clsx(
          "px-4 py-2 flex items-center font-bold cursor-default",
          disabled ? "text-hint-color" : "hover:text-light-default hover:bg-surface-1"
        )}
        disabled={disabled}
        onClick={openModal(modalType)}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </button>
    );
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/60 flex">
      <div className="hidden xm:flex">
        <NavTabs
          className="px-2 py-1 font-semibold"
          screens={screens}
          activeClassName="bg-surface-1"
          idleClassName="bg-surface-3 glow-on-hover"
          ready={isReadyApp}
          onClickTab={onClickTab}
        />
      </div>

      <QuickButtons />

      <div className="ml-auto flex">
        {IS_DEV_ENV && (
          <Button
            shape="square"
            icon={refetching ? <LoadingSpin size="small" className="text-black" /> : null}
            onClick={onClickRefetch}
          >
            Refetch
          </Button>
        )}

        <Button variant="primary" shape="square" icon={<FaDonate />} onClick={openModal("DONATE")}>
          Donate
        </Button>

        <div ref={menuRef} className="relative text-light-default">
          <button className={`${buttonCls} bg-surface-3 text-xl`} onClick={() => setMenuDropped(!menuDropped)}>
            <FaBars />
          </button>

          <Popover as="div" className="z-50 right-0 pt-2 pr-2" active={menuDropped} origin="top right">
            <div className="flex flex-col bg-light-default text-black rounded-md overflow-hidden shadow-common">
              {renderOption(option.INTRO)}
              {renderOption(option.GUIDE)}
              <NavTabs
                className="px-4 py-2 xm:hidden font-bold"
                screens={screens}
                activeClassName="border-l-4 border-secondary-1 bg-surface-1 text-light-default"
                ready={isReadyApp}
                onClickTab={(tab) => {
                  onClickTab(tab);
                  closeMenu();
                }}
              />
              {renderOption(option.SETTINGS)}
              {renderOption(option.DOWNLOAD)}
              {renderOption(option.UPLOAD)}
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
}
