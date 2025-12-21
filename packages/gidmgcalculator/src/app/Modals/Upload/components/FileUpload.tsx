import { useRef } from "react";
import { FaUpload } from "react-icons/fa";
import { Button, Modal, notification } from "rond";

import type { CurrentDatabaseData } from "@/mirgration/types/current";

import { convertGOODData } from "../logic/convertGOODData";
import { migrateUploadData } from "../logic/migrateUploadData";

type GetFileResult =
  | {
      status: "FAILED";
    }
  | {
      status: "SUCCESS";
      file: File;
      isJson: boolean;
    };

const getFile = (input: HTMLInputElement | null): GetFileResult => {
  const file = input?.files?.[0];
  if (!file) {
    return { status: "FAILED" };
  }

  const isText = /text.*/.test(file.type);
  const isJson = /application.*/.test(file.type);

  if (!isText && !isJson) {
    return { status: "FAILED" };
  }

  return { status: "SUCCESS", file, isJson };
};

type FileUploadProps = {
  onSuccessUploadFile: (data: CurrentDatabaseData) => void;
};

const FileUploadCore = ({ onSuccessUploadFile }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    const result = getFile(inputRef.current);

    if (result.status === "FAILED") {
      return;
    }

    const { file, isJson } = result;
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        let data = JSON.parse((event.target?.result as string) || "");
        if (isJson) data = convertGOODData(data);

        const migrateResult = migrateUploadData(data);

        if (migrateResult.status === "FAILED") {
          notification.error({
            content: migrateResult.error,
          });
          return;
        }

        onSuccessUploadFile(migrateResult.data);
      } catch (err) {
        console.error(err);

        notification.error({
          content: "An error occurred while reading your data.",
        });
      }

      if (inputRef.current) {
        inputRef.current.files = null;
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        hidden
        type="file"
        // accept="text/*"
        accept="text/*,application/json"
        onChange={handleFileUpload}
      />
      <Button
        className="mx-auto"
        variant="primary"
        icon={<FaUpload />}
        onClick={() => inputRef.current?.click()}
      >
        Select File
      </Button>
      <p className="px-6 text-center text-light-1">
        Upload a .txt file of GIDC or a .json file in GOOD format
      </p>
    </div>
  );
};

export const FileUpload = Modal.wrap(FileUploadCore, {
  preset: "small",
  title: "Upload",
  className: "bg-dark-1",
});
