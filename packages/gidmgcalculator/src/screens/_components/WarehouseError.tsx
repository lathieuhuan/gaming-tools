import { FallbackProps } from "react-error-boundary";
import { FaDownload } from "react-icons/fa";
import { Button, WarehouseLayout } from "rond";

import { SystemError } from "@/utils/SystemError";
import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { fixV4MigrationError } from "@Store/userdb-slice";

export function WarehouseError({ error, resetErrorBoundary }: FallbackProps) {
  const dispatch = useDispatch();

  const fixable = error instanceof SystemError && error.detail.type === "V4_MIGRATION_ERROR";

  const openDownloadModal = () => dispatch(updateUI({ appModalType: "DOWNLOAD" }));

  const handleFix = () => {
    dispatch(fixV4MigrationError());
    resetErrorBoundary();
  };

  return (
    <WarehouseLayout className="h-full">
      {fixable ? (
        <div className="size-full flex flex-col items-center gap-3">
          <p className="text-lg text-danger-2">There was an error loading your data.</p>
          <Button variant="primary" onClick={handleFix}>
            Let's fix it!
          </Button>
        </div>
      ) : (
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
      )}
    </WarehouseLayout>
  );
}
