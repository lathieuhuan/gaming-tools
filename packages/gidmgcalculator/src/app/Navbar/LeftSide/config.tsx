import { SCREEN_PATH } from "@/constants/config";

export type ScreenConfig = {
  label: string;
  path: string;
};

export const SCREENS: ScreenConfig[] = [
  {
    label: "Calculator",
    path: SCREEN_PATH.CALCULATOR,
  },
  {
    label: "My Setups",
    path: SCREEN_PATH.SETUPS,
  },
  {
    label: "My Artifacts",
    path: SCREEN_PATH.ARTIFACTS,
  },
  {
    label: "My Weapons",
    path: SCREEN_PATH.WEAPONS,
  },
  {
    label: "My Characters",
    path: SCREEN_PATH.CHARACTERS,
  },
];
