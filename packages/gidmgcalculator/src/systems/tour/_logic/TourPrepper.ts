import { nextFrame } from "@/utils/window.utils";
import type { TourSite, TourStep, TourStepErrorCode } from "../_types";

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

  private async prep(index: number): Promise<TourSite | undefined> {
    const step = this.steps[index];

    if (!step) {
      this.onFinish?.();

      return undefined;
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

      return undefined;
    }

    const { siteGutter = 0 } = step;
    const { top, left, bottom, right, width, height } = element.getBoundingClientRect();

    const location = {
      top: top - siteGutter,
      left: left - siteGutter,
      bottom: bottom + siteGutter,
      right: right + siteGutter,
      width: width + siteGutter * 2,
      height: height + siteGutter * 2,
    };

    // TODO: when we need to position intro
    let introX = 0;
    let introY = 0;

    return {
      id: step.id,
      stepNo: index + 1,
      location,
      intro: {
        text: step.description,
        x: introX,
        y: introY,
      },
    };
  }
}
