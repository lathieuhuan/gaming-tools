import { useState } from "react";
import { FaBars, FaDonate } from "react-icons/fa";
import { Button, LoadingSpin } from "rond";

import { IS_DEV_ENV, SCREEN_PATH } from "@/constants/config";
import { $AppData } from "@/services";
import { useRouter } from "@/systems/router";
import { useDispatch } from "@Store/hooks";
import { updateUI, type UIState } from "@Store/ui-slice";
import { ModalOption } from "./_config";

import { EnkaLogo } from "@/assets/icons";
import { PopoverAction } from "@/components";
import { MenuOption, ModalOptions } from "./ModalOptions";
// import { updateCache } from "@/services/enka";

type RightSideProps = {
  appReady?: boolean;
};

export function RightSide({ appReady }: RightSideProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refetching, setRefetching] = useState(false);

  const openModal = (type: UIState["appModalType"]) => () => {
    dispatch(updateUI({ appModalType: type }));
  };

  const handleSelectModal = (option: ModalOption) => {
    dispatch(updateUI({ appModalType: option.modalType }));
  };

  const handleSelectEnkaImport = () => {
    router.navigate(SCREEN_PATH.ENKA);
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

      <PopoverAction
        className="z-50 right-0 pt-2 pr-2"
        origin="top right"
        content={(close) => (
          <div className="bg-light-1 text-black rounded-md overflow-hidden shadow-common">
            <ModalOptions
              disabledTypes={appReady ? [] : ["DOWNLOAD", "UPLOAD", "SETTINGS"]}
              onSelect={(option) => {
                handleSelectModal(option);
                close();
              }}
            />
            <MenuOption
              icon={<EnkaLogo className="-mr-1 mb-1 text-xl shrink-0" />}
              label="Enka Import"
              disabled={!appReady}
              onSelect={() => {
                handleSelectEnkaImport();
                close();
              }}
            />
          </div>
        )}
      >
        <button className="w-8 h-8 flex-center bg-dark-3 text-xl">
          <FaBars />
        </button>
      </PopoverAction>
    </div>
  );
}
