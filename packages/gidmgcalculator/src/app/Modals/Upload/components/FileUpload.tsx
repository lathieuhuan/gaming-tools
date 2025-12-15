import { useRef } from "react";
import { FaUpload } from "react-icons/fa";
import { Button, Modal, notification } from "rond";

import type { UploadedData } from "../types";

import { DOWNLOADED_DATA_VERSION } from "@/constants";
import { convertGOODData } from "../utils/convertGOODData";
import { convertToV3_1 } from "../utils/convertToV3_1";

interface FileUploadProps {
  onSuccessUploadFile: (data: UploadedData) => void;
}
const FileUploadCore = ({ onSuccessUploadFile }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onUploadFile = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isJson = /application.*/.test(file.type);

    if (/text.*/.test(file.type) || isJson) {
      reader.onload = function (event) {
        try {
          let data = JSON.parse((event.target?.result as string) || "");
          if (isJson) data = convertGOODData(data);

          const version = +data.version;

          if (version < 3) {
            notification.error({
              content: "Your data are too old and cannot be converted to the current version.",
            });
          }
          if (version === 3) {
            return onSuccessUploadFile(convertToV3_1(data));
          }
          if (version === DOWNLOADED_DATA_VERSION) {
            return onSuccessUploadFile(data);
          }

          notification.error({
            content: "Your version of data cannot be recognised.",
          });
        } catch (err) {
          console.log(err);

          notification.error({
            content: "An error occurred while reading your data.",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        hidden
        type="file"
        // accept="text/*"
        accept="text/*,application/json"
        onChange={onUploadFile}
      />
      <Button className="mx-auto" variant="primary" icon={<FaUpload />} onClick={() => inputRef.current?.click()}>
        Select File
      </Button>
      <p className="px-6 text-center text-light-1">Upload a .txt file of GIDC or a .json file in GOOD format</p>
    </div>
  );
};

export const FileUpload = Modal.wrap(FileUploadCore, {
  preset: "small",
  title: "Upload",
  className: "bg-dark-1",
});
