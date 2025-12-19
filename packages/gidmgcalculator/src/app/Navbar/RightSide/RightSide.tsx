import { useState } from "react";
import { FaBars, FaDonate } from "react-icons/fa";
import { Button, LoadingSpin, Popover, useClickOutside } from "rond";

import { IS_DEV_ENV, SCREEN_PATH } from "@/constants";
import { $AppData } from "@/services";
import { useRouter } from "@/systems/router";
import { useDispatch } from "@Store/hooks";
import { updateUI, type UIState } from "@Store/ui-slice";
import { ModalOption } from "./_config";

import { EnkaSvg } from "@/components/icons/EnkaSvg";
import { MenuOption, ModalOptions } from "./ModalOptions";
// import { updateCache } from "@/services/enka";

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

    const response = await $AppData.fetchAllData();

    if (response.data) {
      $AppData.populate(response.data);
      alert(`Refetched version: ${response.data.version}`);
    } else {
      alert(`Refetching has failed!`);
    }

    setRefetching(false);
  };

  // const handleUpdateCache = async () => {
  //   console.log("Updating cache...");
  //   const response = await updateCache();
  //   console.log("Completed!");
  //   console.log(response);
  // };

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

      {/* <Button variant="primary" shape="square" icon={<FaDonate />} onClick={handleUpdateCache}>
        Update Cache
      </Button> */}

      <Button variant="primary" shape="square" icon={<FaDonate />} onClick={openModal("DONATE")}>
        Donate
      </Button>

      <div ref={menuRef} className="relative text-light-1">
        <button
          className="w-8 h-8 flex-center bg-dark-3 text-xl"
          onClick={() => setMenuActive(!menuActive)}
        >
          <FaBars />
        </button>

        <Popover as="div" className="z-50 right-0 pt-2 pr-2" active={menuActive} origin="top right">
          <div className="bg-light-1 text-black rounded-md overflow-hidden shadow-common">
            <ModalOptions
              disabledTypes={appReady ? [] : ["DOWNLOAD", "UPLOAD", "SETTINGS"]}
              onSelect={(option) => {
                handleSelectModal(option);
                closeMenu();
              }}
            />
            <MenuOption
              icon={<EnkaSvg className="-mr-1 mb-1 text-xl shrink-0" />}
              label="Enka Import"
              disabled={!appReady}
              onSelect={handleSelectEnkaImport}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
}
