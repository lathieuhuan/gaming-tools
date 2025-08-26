import { ReactNode } from "react";
import { FaCog, FaDownload, FaInfoCircle, FaQuestionCircle, FaUpload } from "react-icons/fa";

import { UIState } from "@Store/ui-slice";

export type ScreenConfig = {
  label: string;
  value: UIState["atScreen"];
  path: string;
};

export const SCREENS: ScreenConfig[] = [
  {
    label: "Calculator",
    value: "CALCULATOR",
    path: "/",
  },
  {
    label: "My Setups",
    value: "MY_SETUPS",
    path: "/my-setups",
  },
  {
    label: "My Artifacts",
    value: "MY_ARTIFACTS",
    path: "/my-artifacts",
  },
  {
    label: "My Weapons",
    value: "MY_WEAPONS",
    path: "/my-weapons",
  },
  {
    label: "My Characters",
    value: "MY_CHARACTERS",
    path: "/my-characters",
  },
  // {
  //   label: "Enka Import",
  //   value: "ENKA_IMPORT",
  //   path: "/enka",
  // },
];

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
];
