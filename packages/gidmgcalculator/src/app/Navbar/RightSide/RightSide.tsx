import { useQuery } from "@tanstack/react-query";
import { FaBars, FaDonate } from "react-icons/fa";
import { Button, LoadingSpin } from "rond";

import type { ModalOption } from "./config";

import { IS_DEV_ENV, SCREEN_PATH } from "@/constants/config";
import { useRouter } from "@/lib/router";
import { appDataQueryOptions } from "@/services/app-data";
import { updateUI, type UIState } from "@Store/ui";

import { EnkaLogo } from "@/assets/icons";
import { PopoverAction } from "@/components/PopoverAction";
import { clearCache } from "@/services/app-data/cache";
import { MenuOption, ModalOptions } from "./ModalOptions";
// import { updateCache } from "@/services/enka";

type RightSideProps = {
  appReady?: boolean;
};

export function RightSide({ appReady }: RightSideProps) {
  const router = useRouter();
  const { isRefetching, refetch } = useQuery({
    ...appDataQueryOptions,
    enabled: false,
  });

  const openModal = (type: UIState["appModalType"]) => () => {
    updateUI({ appModalType: type });
  };

  const handleSelectModal = (option: ModalOption) => {
    updateUI({ appModalType: option.modalType });
  };

  const handleSelectEnkaImport = () => {
    router.navigate({ to: SCREEN_PATH.ENKA });
  };

  const handleRefetch = () => {
    void refetch().then(({ data }) => {
      if (data) {
        alert(`Refetched version: ${data.version}`);
      } else {
        alert(`Refetching has failed!`);
      }

      clearCache();
    });
  };

  // const handleUpdateCache = () => {
  //   console.log("Updating cache...");

  //   void updateCache().then((response) => {
  //     console.log("Completed!");
  //     console.log(response);
  //   });
  // };

  return (
    <div className="flex">
      {IS_DEV_ENV && (
        <Button
          shape="square"
          icon={isRefetching ? <LoadingSpin size="small" className="text-black" /> : null}
          onClick={() => void handleRefetch()}
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
        content={({ handleClose }) => (
          <div className="bg-light-1 text-black rounded-md overflow-hidden shadow-common">
            <ModalOptions
              disabledTypes={appReady ? [] : ["DOWNLOAD", "UPLOAD", "SETTINGS"]}
              onSelect={(option) => {
                handleSelectModal(option);
                handleClose();
              }}
            />
            <MenuOption
              icon={<EnkaLogo className="-mr-1 mb-1 text-xl shrink-0" />}
              label="Enka Import"
              disabled={!appReady}
              onSelect={() => {
                handleSelectEnkaImport();
                handleClose();
              }}
            />
          </div>
        )}
      >
        {(props) => (
          <button className="w-8 h-8 flex-center bg-dark-3 text-xl" onClick={props.onClick}>
            <FaBars />
          </button>
        )}
      </PopoverAction>
    </div>
  );
}
