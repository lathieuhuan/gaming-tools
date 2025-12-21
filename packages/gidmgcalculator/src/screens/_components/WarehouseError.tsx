import { FaDownload } from "react-icons/fa";
import { Button, WarehouseLayout } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

export function WarehouseError() {
  const dispatch = useDispatch();

  const openDownloadModal = () => dispatch(updateUI({ appModalType: "DOWNLOAD" }));

  return (
    <WarehouseLayout className="h-full">
      <div className="size-full">
        <p className="text-lg text-center text-danger-2">
          There was an error loading your data. You can download and send me your data for
          troubleshooting.
        </p>
        <div className="mt-4 flex justify-center">
          <Button onClick={openDownloadModal} icon={<FaDownload />}>
            Download
          </Button>
        </div>
      </div>
    </WarehouseLayout>
  );
}
