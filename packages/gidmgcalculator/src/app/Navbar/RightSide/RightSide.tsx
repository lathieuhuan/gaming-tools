import { useState } from "react";
import { FaBars, FaDonate } from "react-icons/fa";
import { Button, LoadingSpin, Popover, useClickOutside } from "rond";

import { SCREEN_PATH } from "@Src/app/config";
import { IS_DEV_ENV } from "@Src/constants";
import { $AppData } from "@Src/services";
import { useRouter } from "@Src/systems/router";
import { useDispatch } from "@Store/hooks";
import { updateUI, type UIState } from "@Store/ui-slice";
import { ModalOption } from "./config";

import { MenuOption } from "./MenuOption";
import { ModalOptions } from "./ModalOptions";

const enkaIcon = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767z"
    ></path>
  </svg>
);

type RightSideProps = {
  appReady?: boolean;
};

export function RightSide({ appReady }: RightSideProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuActive, setMenuActive] = useState(false);
  const [refetching, setRefetching] = useState(false);

  const closeMenu = () => setMenuActive(false);

  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  const openModal = (type: UIState["appModalType"]) => () => {
    dispatch(updateUI({ appModalType: type }));
    closeMenu();
  };

  const handleSelectModal = (option: ModalOption) => {
    dispatch(updateUI({ appModalType: option.modalType }));
    closeMenu();
  };

  const handleSelectEnkaImport = () => {
    router.navigate(SCREEN_PATH.ENKA);
    closeMenu();
  };

  const handleRefetch = async () => {
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

  return (
    <div className="flex">
      {IS_DEV_ENV && (
        <Button
          shape="square"
          icon={refetching ? <LoadingSpin size="small" className="text-black" /> : null}
          onClick={handleRefetch}
        >
          Refetch
        </Button>
      )}

      <Button variant="primary" shape="square" icon={<FaDonate />} onClick={openModal("DONATE")}>
        Donate
      </Button>

      <div ref={menuRef} className="relative text-light-default">
        <button className="w-8 h-8 flex-center bg-surface-3 text-xl" onClick={() => setMenuActive(!menuActive)}>
          <FaBars />
        </button>

        <Popover as="div" className="z-50 right-0 pt-2 pr-2" active={menuActive} origin="top right">
          <div className="bg-light-default text-black rounded-md overflow-hidden shadow-common">
            <ModalOptions
              disabledTypes={appReady ? [] : ["DOWNLOAD", "UPLOAD", "SETTINGS"]}
              onSelect={(option) => {
                handleSelectModal(option);
                closeMenu();
              }}
            />
            <MenuOption icon={enkaIcon} label="Enka Import" disabled={!appReady} onSelect={handleSelectEnkaImport} />
          </div>
        </Popover>
      </div>
    </div>
  );
}
