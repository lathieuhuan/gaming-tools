import { FaDownload } from "react-icons/fa";
import { Button, Modal } from "rond";

import { DOWNLOADED_DATA_VERSION } from "@/constants";
import { useSelector } from "@Store/hooks";
import { selectUserArtifacts, selectUserCharacters, selectUserSetups, selectUserWeapons } from "@Store/userdb-slice";

function DownloadCore() {
  const userChars = useSelector(selectUserCharacters);
  const userWps = useSelector(selectUserWeapons);
  const userArts = useSelector(selectUserArtifacts);
  const userSetups = useSelector(selectUserSetups);

  const onClickDownload = () => {
    const downloadData = JSON.stringify({
      version: DOWNLOADED_DATA_VERSION,
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

      <p className="text-center text-danger-3">Please DO NOT modify this file if you don't understand how it works.</p>
    </div>
  );
}

export const Download = Modal.wrap(DownloadCore, {
  preset: "small",
  title: "Download",
  className: "bg-surface-1",
});
