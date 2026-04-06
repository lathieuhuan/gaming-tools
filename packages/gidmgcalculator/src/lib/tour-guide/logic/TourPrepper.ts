import { nextFrame } from "@/utils/window.utils";
import type {
  TourSite,
  TourSiteIntro,
  TourSiteLocation,
  TourStep,
  TourStepErrorCode,
} from "../types";

export type TourPrepperOptions = {
  onError?: (code: TourStepErrorCode) => void;
  onFinish?: () => void;
};

export class TourPrepper implements TourPrepperOptions {
  public steps: TourStep[] = [];
  public site?: TourSite;
  private currentIndex: number = 0;

  onError?: (code: TourStepErrorCode) => void;
  onFinish?: () => void;

  constructor(options: TourPrepperOptions = {}) {
    this.onError = options.onError;
    this.onFinish = options.onFinish;
  }

  // ===== CORE LOGIC =====

  start(steps: TourStep[]) {
    this.steps = steps;
    this.currentIndex = 0;

    return this.prep(0);
  }

  async next() {
    const { lastCheck } = this.steps[this.currentIndex];

    try {
      await lastCheck?.();
    } catch (error) {
      console.error(error);
    }

    return this.prep(++this.currentIndex);
  }

  private getIntroOffsetX(location: TourSiteLocation, introWidth: number): number {
    const halfWidth = introWidth / 2;
    const siteLeftToWindowLeft = Math.ceil(location.left + location.width / 2);

    if (siteLeftToWindowLeft < halfWidth) {
      return halfWidth - siteLeftToWindowLeft;
    }

    const siteRightToWindowRight = Math.ceil(
      window.innerWidth - (location.left + location.width / 2)
    );

    if (siteRightToWindowRight < halfWidth) {
      return siteRightToWindowRight - halfWidth;
    }

    return 0;
  }

  private async prep(index: number): Promise<TourSite | undefined> {
    const step = this.steps[index];

    if (!step) {
      this.onFinish?.();
      return;
    }

    try {
      if (step.sitePrep) {
        await step.sitePrep();
        await nextFrame();
      }

      await step.go?.();
    } catch (error) {
      console.error(error);
    }

    await nextFrame();

    const element = document.getElementById(step.id);

    if (!element) {
      this.onError?.("NOT_FOUND");
      return;
    }

    const { siteGutter = 0 } = step;
    const [gutterY, gutterX] = Array.isArray(siteGutter) ? siteGutter : [siteGutter, siteGutter];
    const { top, left, width, height } = element.getBoundingClientRect();

    const location: TourSiteLocation = {
      top: top - gutterY,
      left: left - gutterX,
      width: width + gutterX * 2,
      height: height + gutterY * 2,
    };

    const introWidth = 256; // limit to window.innerWidth when it's dynamic

    return {
      id: step.id,
      stepNo: index + 1,
      location,
      intro: {
        dialogs: step.dialogs,
        width: introWidth,
        offsetX: this.getIntroOffsetX(location, introWidth),
      },
    };
  }
}
