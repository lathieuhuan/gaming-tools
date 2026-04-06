// type IntroAlign = "left" | "center" | "right";

// type IntroOffsetX = {
//   type: "left" | "right";
//   value: number;
// };

export type TourStepDialog = string | React.ReactElement;

export type TourStep = {
  id: string;
  dialogs: TourStepDialog[];
  siteGutter?: number | [number, number];
  // ENHANCE: when we need to position intro
  // introAlign?: IntroAlign;
  // introOffsetX?: IntroOffsetX;
  // introWidth?: number;
  /** IDEA: return dynamic id and other configs */
  sitePrep?: () => void | Promise<void>;
  go?: () => void | Promise<void>;
  lastCheck?: () => void | Promise<void>;
};

export type TourSiteLocation = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type TourSiteIntro = {
  dialogs: TourStepDialog[];
  width: number;
  offsetX: number;
};

export type TourSite = {
  id: string;
  stepNo: number;
  location: TourSiteLocation;
  intro: TourSiteIntro;
};

export type TourStepErrorCode = "NOT_FOUND";
