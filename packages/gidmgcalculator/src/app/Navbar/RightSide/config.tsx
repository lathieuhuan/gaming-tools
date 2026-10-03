import type { AppModalType } from "@Store/ui/types";
import type { ReactNode } from "react";

import { EnkaLogo } from "@/assets/icons";
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

export type MenuOptionValue =
  | Extract<
      AppModalType,
      | "INTRO"
      | "GUIDES"
      | "VERSIONS"
      | "TRAVEL_AGENCY"
      | "SETTINGS"
      | "DOWNLOAD"
      | "UPLOAD"
      | "DATA_REPAIR"
    >
  | "ENKA_IMPORT";

export type MenuOption = {
  label: string;
  icon: ReactNode;
  value: MenuOptionValue;
};

export const MENU_OPTIONS: MenuOption[] = [
  {
    label: "Introduction",
    icon: <FaInfoCircle size="1.125rem" />,
    value: "INTRO",
  },
  {
    label: "Guides",
    icon: <FaQuestionCircle />,
    value: "GUIDES",
  },
  {
    label: "Versions",
    icon: <TbVersionsFilled className="-mx-0.5 text-xl" />,
    value: "VERSIONS",
  },
  {
    label: "App Tours",
    icon: <FaMapMarkedAlt />,
    value: "TRAVEL_AGENCY",
  },
  {
    label: "Settings",
    icon: <FaCog />,
    value: "SETTINGS",
  },
  {
    label: "Download",
    icon: <FaDownload />,
    value: "DOWNLOAD",
  },
  {
    label: "Upload",
    icon: <FaUpload />,
    value: "UPLOAD",
  },
  {
    label: "Fix my data",
    icon: <FaWrench />,
    value: "DATA_REPAIR",
  },
  {
    label: "Enka Import",
    icon: <EnkaLogo className="-mx-0.5 mb-1 text-xl shrink-0" />,
    value: "ENKA_IMPORT",
  },
];
