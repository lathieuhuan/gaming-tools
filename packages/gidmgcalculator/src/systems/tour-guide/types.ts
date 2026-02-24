// type IntroAlign = "left" | "center" | "right";

// type IntroOffsetX = {
//   type: "left" | "right";
//   value: number;
// };

export type TourStepDialog = string | React.ReactElement;

export type TourStep = {
  id: string;
  dialogs: TourStepDialog[];
  siteGutter?: number;
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
  // bottom: number;
  // right: number;
  width: number;
  height: number;
};

type TourSiteIntro = {
  dialogs: TourStepDialog[];
  x: number;
  y: number;
};

export type TourSite = {
  id: string;
  stepNo: number;
  location: TourSiteLocation;
  intro: TourSiteIntro;
};

export type TourStepErrorCode = "NOT_FOUND";
