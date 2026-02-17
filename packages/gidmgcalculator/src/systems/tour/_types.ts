// type IntroAlign = "left" | "center" | "right";

// type IntroOffsetX = {
//   type: "left" | "right";
//   value: number;
// };

export type TourStep = {
  id: string;
  description: React.ReactNode;
  siteGutter?: number;
  // ENHANCE: when we need to position intro
  // introAlign?: IntroAlign;
  // introOffsetX?: IntroOffsetX;
  // introWidth?: number;
  /** IDEA: return dynamic id and other configs */
  go?: () => void | Promise<void>;
};

export type TourSiteLocation = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

type TourSiteIntro = {
  text: React.ReactNode;
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
