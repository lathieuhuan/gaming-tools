import { useState } from "react";
import { FaBars, FaDonate } from "react-icons/fa";
import { Button, LoadingSpin, Popover, useClickOutside } from "rond";

import { IS_DEV_ENV } from "@Src/constants";
import { $AppData } from "@Src/services";
import { useDispatch } from "@Store/hooks";
import { updateUI, type UIState } from "@Store/ui-slice";
import { ModalOption } from "../config";

import { ModalOptions } from "./ModalOptions";

type RightSideProps = {
  appReady?: boolean;
};

export function RightSide({ appReady }: RightSideProps) {
  const dispatch = useDispatch();
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
          </div>
        </Popover>
      </div>
    </div>
  );
}
