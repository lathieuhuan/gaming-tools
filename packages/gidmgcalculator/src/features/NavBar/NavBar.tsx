import { useState } from "react";
import {
  FaBars,
  FaCog,
  FaDonate,
  FaDownload,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
  FaUpload,
} from "react-icons/fa";
import { useClickOutside, Button } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI, type UIState, type AppScreen } from "@Store/ui-slice";
import { ActionButton, NavTabs } from "./navbar-components";

export function NavBar() {
  const dispatch = useDispatch();
  const trackerState = useSelector((state) => state.ui.trackerState);
  const appReady = useSelector((state) => state.ui.ready);
  const [menuDropped, setMenuDropped] = useState(false);

  const closeMenu = () => setMenuDropped(false);

  const ref = useClickOutside<HTMLDivElement>(closeMenu);

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
      <div className="flex">
        <div className="hidden xm:flex">
          <NavTabs
            className="px-2 py-1 font-semibold"
            activeClassName="bg-surface-1"
            idleClassName="bg-surface-3 glow-on-hover"
            ready={appReady}
            onClickTab={onClickTab}
          />
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

          <div ref={ref} className="relative text-light-default">
            <button className="w-8 h-8 flex-center bg-surface-3 text-xl" onClick={() => setMenuDropped(!menuDropped)}>
              <FaBars />
            </button>

            <div
              className={
                "absolute top-full right-0 z-50 origin-top-right transition-transform duration-200 pt-2 pr-2 " +
                (menuDropped ? "scale-100" : "scale-0")
              }
            >
              <div className="flex flex-col bg-light-default text-black rounded-md overflow-hidden shadow-common">
                <ActionButton
                  label="Introduction"
                  icon={<FaInfoCircle size="1.125rem" />}
                  onClick={openModal("INTRO")}
                />
                <ActionButton label="Guides" icon={<FaQuestionCircle />} onClick={openModal("GUIDES")} />

                <NavTabs
                  className="px-4 py-2 xm:hidden font-bold"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
