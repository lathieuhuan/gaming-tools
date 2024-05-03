import { useState } from "react";
import { FaBars, FaCog, FaDonate, FaDownload, FaInfoCircle, FaQuestionCircle, FaSkull, FaUpload } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { useClickOutside, Button, Popover, useScreenWatcher, LoadingSpin } from "rond";

import { useGetMetadata } from "@Src/hooks";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI, type UIState, type AppScreen } from "@Store/ui-slice";
import { ActionButton, NavTabs, NavTabsProps } from "./navbar-components";

const buttonCls = "w-8 h-8 flex-center";

export function NavBar() {
  const dispatch = useDispatch();
  const appReady = useSelector((state) => state.ui.ready);
  const [menuDropped, setMenuDropped] = useState(false);

  const { status, getMetadata } = useGetMetadata();

  const closeMenu = () => setMenuDropped(false);

  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  const screens: NavTabsProps["screens"] = [
    { label: "My Characters", value: "MY_CHARACTERS" },
    { label: "My Weapons", value: "MY_WEAPONS" },
    { label: "My Artifacts", value: "MY_ARTIFACTS" },
    { label: "My Setups", value: "MY_SETUPS" },
    { label: "Calculator", value: "CALCULATOR" },
  ];

  const openModal = (type: UIState["appModalType"]) => () => {
    dispatch(updateUI({ appModalType: type }));
    closeMenu();
  };

  const onClickTab = (tab: AppScreen) => {
    dispatch(updateUI({ atScreen: tab }));
  };

  const onClickTargetButton = () => {
    dispatch(updateUI({ calcTargetConfig: { active: true, onOverview: false } }));
  };

  const onClickTrackerButton = () => {
    dispatch(updateUI({ trackerState: "open" }));
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/60 flex">
      <div className="hidden xm:flex">
        <NavTabs
          className="px-2 py-1 font-semibold"
          screens={screens}
          activeClassName="bg-surface-1"
          idleClassName="bg-surface-3 glow-on-hover"
          ready={appReady}
          onClickTab={onClickTab}
        />
      </div>

      <div className="flex">
        <TargetButton onClick={onClickTargetButton} />
        <TrackerButton onClick={onClickTrackerButton} />
      </div>

      <div className="ml-auto flex">
        {import.meta.env.DEV && (
          <Button
            shape="square"
            icon={status === "loading" ? <LoadingSpin size="small" className="text-black" /> : null}
            onClick={() => getMetadata(true)}
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

          <Popover as="div" className="z-50 right-0 pt-2 pr-2" active={menuDropped} origin="top-right">
            <div className="flex flex-col bg-light-default text-black rounded-md overflow-hidden shadow-common">
              <ActionButton label="Introduction" icon={<FaInfoCircle size="1.125rem" />} onClick={openModal("INTRO")} />
              <ActionButton label="Guides" icon={<FaQuestionCircle />} onClick={openModal("GUIDES")} />
              <NavTabs
                className="px-4 py-2 xm:hidden font-bold"
                screens={screens}
                activeClassName="border-l-4 border-secondary-1 bg-surface-1 text-light-default"
                ready={appReady}
                onClickTab={(tab) => {
                  onClickTab(tab);
                  closeMenu();
                }}
              />
              <ActionButton label="Settings" icon={<FaCog />} onClick={openModal("SETTINGS")} />
              <ActionButton
                label="Download"
                disabled={!appReady}
                icon={<FaDownload />}
                onClick={openModal("DOWNLOAD")}
              />
              <ActionButton label="Upload" disabled={!appReady} icon={<FaUpload />} onClick={openModal("UPLOAD")} />
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
}

interface ButtonProps {
  onClick: () => void;
}

function TrackerButton(props: ButtonProps) {
  const atScreen = useSelector((state) => state.ui.atScreen);
  const trackerState = useSelector((state) => state.ui.trackerState);

  if (trackerState === "hidden" && atScreen === "CALCULATOR") {
    return (
      <button className={`${buttonCls} text-xl text-black bg-active-color`} onClick={props.onClick}>
        <BiDetail />
      </button>
    );
  }
  return null;
}

function TargetButton(props: ButtonProps) {
  const screenWatcher = useScreenWatcher();
  const atScreen = useSelector((state) => state.ui.atScreen);
  const isModernUI = useSelector((state) => state.ui.isTabLayout);
  const calcTargetConfig = useSelector((state) => state.ui.calcTargetConfig);

  if (!calcTargetConfig.onOverview && atScreen === "CALCULATOR" && !screenWatcher.isFromSize("sm") && isModernUI) {
    return (
      <button className={`${buttonCls} bg-surface-3`} onClick={props.onClick}>
        <FaSkull />
      </button>
    );
  }
  return null;
}
