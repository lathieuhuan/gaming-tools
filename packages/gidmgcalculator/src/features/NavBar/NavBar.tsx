import { useState } from "react";
import {
  FaBars,
  FaChevronDown,
  FaCog,
  FaDonate,
  FaDownload,
  FaInfoCircle,
  FaQuestionCircle,
  FaUpload,
} from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { useClickOutside, Button, Popover, CollapseSpace, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI, type UIState, type AppScreen } from "@Store/ui-slice";
import { ActionButton, NavTabs, NavTabsProps } from "./navbar-components";
import { selectActiveId, selectSetupManageInfos, updateCalculator } from "@Store/calculator-slice";

export function NavBar() {
  const dispatch = useDispatch();
  const trackerState = useSelector((state) => state.ui.trackerState);
  const appReady = useSelector((state) => state.ui.ready);
  const [menuDropped, setMenuDropped] = useState(false);

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

  const onClickTrackerIcon = () => {
    dispatch(updateUI({ trackerState: "open" }));
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/60">
      <div className="flex gap-4">
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

        <QuickSetupSelect />

        <div className="ml-auto flex">
          <Button variant="primary" shape="square" icon={<FaDonate />} onClick={openModal("DONATE")}>
            Donate
          </Button>

          {trackerState !== "close" ? (
            <button className="w-8 h-8 flex-center text-xl text-black bg-active-color" onClick={onClickTrackerIcon}>
              <BiDetail />
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
    </div>
  );
}

function QuickSetupSelect() {
  const atScreen = useSelector((state) => state.ui.atScreen);
  const screenWatcher = useScreenWatcher();
  return atScreen === "CALCULATOR" && screenWatcher.isToSize("sm") ? <QuickSetupSelectCore /> : null;
}

function QuickSetupSelectCore() {
  const dispatch = useDispatch();
  const manageInfos = useSelector(selectSetupManageInfos);
  const activeId = useSelector(selectActiveId);
  const [selectDropped, setSelectDropped] = useState(false);

  const closeSelect = () => setSelectDropped(false);

  const selectRef = useClickOutside<HTMLDivElement>(closeSelect);

  const currentSetup = manageInfos.find((info) => info.ID === activeId);

  const onSelectSetup = (id: number) => {
    dispatch(updateCalculator({ activeId: id }));
    closeSelect();
  };

  return (
    <div ref={selectRef} className="relative">
      {manageInfos.length > 1 ? (
        <button
          type="button"
          className="px-3 py-1.5 text-sm bg-surface-2 flex items-center justify-between gap-1.5"
          style={{
            minWidth: "9rem",
            maxWidth: "18rem",
          }}
          onClick={() => setSelectDropped(!selectDropped)}
        >
          <span className="truncate">{currentSetup?.name}</span>
          <span className="shrink-0">
            <FaChevronDown />
          </span>
        </button>
      ) : null}

      <CollapseSpace
        active={selectDropped}
        className="absolute z-50 top-full left-0 min-w-full rounded-br shadow-common"
        moveDuration={150}
      >
        <div className="flex flex-col bg-light-default text-black">
          {manageInfos.map((info, i) => {
            return (
              <button
                key={i}
                type="button"
                className={
                  "p-2 text-left font-bold whitespace-nowrap" +
                  (info.ID === currentSetup?.ID ? " bg-light-disabled" : "")
                }
                onClick={() => onSelectSetup(info.ID)}
              >
                {info.name}
              </button>
            );
          })}
        </div>
      </CollapseSpace>
    </div>
  );
}
