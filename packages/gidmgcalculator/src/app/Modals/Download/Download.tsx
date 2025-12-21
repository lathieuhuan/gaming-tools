import { FaDownload } from "react-icons/fa";
import { Button, Modal } from "rond";

import { DATABASE_DATA_VERSION } from "@/constants/config";
import { useSelector } from "@Store/hooks";
import { selectDbArtifacts, selectDbCharacters, selectUserSetups, selectDbWeapons } from "@Store/userdb-slice";

function DownloadCore() {
  const userChars = useSelector(selectDbCharacters);
  const userWps = useSelector(selectDbWeapons);
  const userArts = useSelector(selectDbArtifacts);
  const userSetups = useSelector(selectUserSetups);

  const onClickDownload = () => {
    const downloadData = JSON.stringify({
      version: DATABASE_DATA_VERSION,
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

      <p className="text-center text-danger-2">Please DO NOT modify this file if you don't understand how it works.</p>
    </div>
  );
}

export const Download = Modal.wrap(DownloadCore, {
  preset: "small",
  title: "Download",
  className: "bg-dark-1",
});
