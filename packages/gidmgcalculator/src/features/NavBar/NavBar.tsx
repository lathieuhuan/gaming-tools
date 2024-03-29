import { useState } from "react";
import {
  FaBars,
  FaChevronDown,
  FaCog,
  FaDonate,
  FaDownload,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
  FaUpload,
} from "react-icons/fa";
import { useClickOutside, Button, Popover, CollapseSpace } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI, type UIState, type AppScreen } from "@Store/ui-slice";
import { ActionButton, NavTabs, NavTabsProps } from "./navbar-components";

export function NavBar() {
  const dispatch = useDispatch();
  const trackerState = useSelector((state) => state.ui.trackerState);
  const atScreen = useSelector((state) => state.ui.atScreen);
  const appReady = useSelector((state) => state.ui.ready);
  const [menuDropped, setMenuDropped] = useState(false);
  const [selectDropped, setSelectDropped] = useState(false);

  const closeMenu = () => setMenuDropped(false);

  const closeSelect = () => setSelectDropped(false);

  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);
  const selectRef = useClickOutside<HTMLDivElement>(closeSelect);

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
    if (tab !== atScreen) {
      dispatch(updateUI({ atScreen: tab }));
    }
  };

  const onClickTrackerIcon = () => {
    dispatch(updateUI({ trackerState: "open" }));
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/60">
      <div className="flex">
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

        <div ref={selectRef} className="block xm:hidden relative">
          <Button
            shape="square"
            variant="custom"
            className="bg-surface-2"
            style={{
              minWidth: "9rem",
              borderRadius: 0,
              justifyContent: "space-between",
            }}
            icon={<FaChevronDown />}
            iconPosition="end"
            onClick={() => setSelectDropped(!selectDropped)}
          >
            {screens.find((screen) => screen.value === atScreen)?.label}
          </Button>

          <CollapseSpace active={selectDropped} className="absolute z-50 top-full left-0" moveDuration={150}>
            <div className="flex flex-col bg-light-default text-black rounded-br overflow-hidden shadow-common">
              <NavTabs
                className="px-4 py-2 font-bold"
                screens={screens}
                activeClassName="bg-light-disabled"
                ready={appReady}
                onClickTab={(tab) => {
                  onClickTab(tab);
                  closeSelect();
                }}
              />
            </div>
          </CollapseSpace>
        </div>

        <div className="ml-auto flex">
          <Button variant="primary" shape="square" icon={<FaDonate />} onClick={openModal("DONATE")}>
            Donate
          </Button>

          {trackerState !== "close" ? (
            <button className="w-8 h-8 flex-center text-xl text-black bg-active-color" onClick={onClickTrackerIcon}>
              <FaSearch />
            </button>
          ) : null}

          <div ref={menuRef} className="relative text-light-default">
            <button className="w-8 h-8 flex-center bg-surface-3 text-xl" onClick={() => setMenuDropped(!menuDropped)}>
              <FaBars />
            </button>

            <Popover as="div" className="z-50 right-0 pt-2 pr-2" active={menuDropped} origin="top-right">
              <div className="flex flex-col bg-light-default text-black rounded-md overflow-hidden shadow-common">
                <ActionButton
                  label="Introduction"
                  icon={<FaInfoCircle size="1.125rem" />}
                  onClick={openModal("INTRO")}
                />
                <ActionButton label="Guides" icon={<FaQuestionCircle />} onClick={openModal("GUIDES")} />
                {/* <NavTabs
                  className="px-4 py-2 xm:hidden font-bold"
                  screens={screens}
                  activeClassName="border-l-4 border-secondary-1 bg-surface-1 text-light-default"
                  ready={appReady}
                  onClickTab={(tab) => {
                    onClickTab(tab);
                    closeMenu();
                  }}
                /> */}
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
    </div>
  );
}
