import { ReactNode } from "react";
import {
  FaCog,
  FaDownload,
  FaInfoCircle,
  FaQuestionCircle,
  FaUpload,
  FaWrench,
} from "react-icons/fa";

import { UIState } from "@Store/ui-slice";

export type ModalOption = {
  label: string;
  icon: ReactNode;
  modalType: UIState["appModalType"];
};

export const MODAL_OPTIONS: ModalOption[] = [
  {
    label: "Introduction",
    icon: <FaInfoCircle size="1.125rem" />,
    modalType: "INTRO",
  },
  {
    label: "Guides",
    icon: <FaQuestionCircle />,
    modalType: "GUIDES",
  },
  {
    label: "Settings",
    icon: <FaCog />,
    modalType: "SETTINGS",
  },
  {
    label: "Download",
    icon: <FaDownload />,
    modalType: "DOWNLOAD",
  },
  {
    label: "Upload",
    icon: <FaUpload />,
    modalType: "UPLOAD",
  },
  {
    label: "Fix my data",
    icon: <FaWrench />,
    modalType: "DATA_FIX",
  },
];
