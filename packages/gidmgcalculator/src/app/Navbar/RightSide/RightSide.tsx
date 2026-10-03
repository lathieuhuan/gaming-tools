import { useQuery } from "@tanstack/react-query";
import { FaBars, FaDonate } from "react-icons/fa";
import { Button, LoadingSpin } from "rond";

import type { MenuOptionValue } from "./config";

import { IS_DEV_ENV, SCREEN_PATH } from "@/constants/config";
import { useRouter } from "@/lib/router";
import { appDataQueryOptions } from "@/services/app-data";
import { clearCache } from "@/services/app-data/cache";
import { updateUI } from "@Store/ui";

import { ModalAction } from "@/components/ModalAction";
import { PopoverAction } from "@/components/PopoverAction";
import { DonateView } from "./DonateView";
import { Menu } from "./Menu";
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

  const handleSelectOption = (value: MenuOptionValue) => {
    switch (value) {
      case "INTRO":
      case "SETTINGS":
      case "GUIDES":
      case "VERSIONS":
      case "TRAVEL_AGENCY":
      case "DOWNLOAD":
      case "UPLOAD":
      case "DATA_REPAIR":
        updateUI({ appModalType: value });
        break;
      case "ENKA_IMPORT":
        handleSelectEnkaImport();
        break;
      default:
        value satisfies never;
    }
  };

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

      <ModalAction
        title={<p className="text-center">Donate</p>}
        preset="small"
        withHeaderDivider={false}
        className="bg-dark-1"
        content={<DonateView />}
      >
        <Button variant="primary" shape="square" icon={<FaDonate />}>
          Donate
        </Button>
      </ModalAction>

      <PopoverAction
        className="z-50 right-0 pt-2 pr-2"
        origin="top right"
        content={({ handleClose }) => (
          <Menu
            appReady={appReady}
            onSelect={(value) => {
              handleSelectOption(value);
              handleClose();
            }}
          />
        )}
      >
        {(props) => (
          <button className="size-8 flex-center bg-dark-3 text-xl" onClick={props.onClick}>
            <FaBars />
          </button>
        )}
      </PopoverAction>
    </div>
  );
}
