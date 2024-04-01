import { useState } from "react";
import { FaBars, FaCog, FaDonate, FaDownload, FaInfoCircle, FaQuestionCircle, FaSkull, FaUpload } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { useClickOutside, Button, Popover, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI, type UIState, type AppScreen } from "@Store/ui-slice";
import { ActionButton, NavTabs, NavTabsProps } from "./navbar-components";

export function NavBar() {
  const dispatch = useDispatch();
  const trackerState = useSelector((state) => state.ui.trackerState);
  const appReady = useSelector((state) => state.ui.ready);
  const [menuDropped, setMenuDropped] = useState(false);

  const closeMenu = () => setMenuDropped(false);

  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  const buttonCls = "w-8 h-8 flex-center";

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

  const onClickTrackerIcon = () => {
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
        <TargetConfigButton className={buttonCls} />

        {trackerState === "hidden" ? (
          <button className={`${buttonCls} text-xl text-black bg-active-color`} onClick={onClickTrackerIcon}>
            <BiDetail />
          </button>
        ) : null}
      </div>

      {/* <div ref={selectRef} className="block xm:hidden relative">
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
        </div> */}

      <div className="ml-auto flex">
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

function TargetConfigButton(props: { className?: string }) {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const atScreen = useSelector((state) => state.ui.atScreen);
  const calcTargetConfig = useSelector((state) => state.ui.calcTargetConfig);

  return screenWatcher.isToSize("sm") && atScreen === "CALCULATOR" && !calcTargetConfig.onOverview ? (
    <button
      className={`${props.className} bg-surface-3`}
      onClick={() => dispatch(updateUI({ calcTargetConfig: { active: true, onOverview: false } }))}
    >
      <FaSkull />
    </button>
  ) : null;
}
