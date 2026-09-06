import type { AppModalType } from "@/store/ui/types";
import type { ReactNode } from "react";

import {
  FaCog,
  FaDownload,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaQuestionCircle,
  FaUpload,
  FaWrench,
} from "react-icons/fa";
import { TbVersionsFilled } from "react-icons/tb";

export type ModalOption = {
  label: string;
  icon: ReactNode;
  modalType: AppModalType;
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
    label: "Versions",
    icon: <TbVersionsFilled className="-mx-0.5 text-xl" />,
    modalType: "VERSIONS",
  },
  {
    label: "App Tours",
    icon: <FaMapMarkedAlt />,
    modalType: "TRAVEL_AGENCY",
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
    modalType: "DATA_REPAIR",
  },
];
