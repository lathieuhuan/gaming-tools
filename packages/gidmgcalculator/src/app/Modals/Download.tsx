import { FaDownload } from "react-icons/fa";
import { Button } from "rond";

import { DOWNLOAD_DATA_VERSION } from "@/constants/config";
import { useStore } from "@/systems/dynamic-store";

export function Download() {
  const store = useStore();

  const onClickDownload = () => {
    const { userChars, userWps, userArts, userSetups } = store.select((state) => state.userdb);

    const downloadData = JSON.stringify({
      version: DOWNLOAD_DATA_VERSION,
      characters: userChars,
      weapons: userWps,
      artifacts: userArts,
      setups: userSetups,
    });

    // type "text/plain" | "application/json"
    const textBlob = new Blob([downloadData], { type: "text/plain" });
    const newLink = document.createElement("a");

    newLink.download = "GDC_Data";

    if (window.webkitURL != null) {
      newLink.href = window.webkitURL.createObjectURL(textBlob);
    } else {
      newLink.href = window.URL.createObjectURL(textBlob);
      newLink.style.display = "none";
      document.body.appendChild(newLink);
    }

    newLink.click();
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button className="mx-auto" variant="primary" icon={<FaDownload />} onClick={onClickDownload}>
        Get File
      </Button>

      <p className="text-center text-danger-2">
        Please DO NOT modify this file if you don't understand how it works.
      </p>
    </div>
  );
}
