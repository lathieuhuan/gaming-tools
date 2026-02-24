import { useRef } from "react";

import { TourPrepper, TourPrepperOptions } from "../logic/TourPrepper";

export function useTourPrepper(options?: TourPrepperOptions) {
  const ref = useRef<TourPrepper | null>(null);

  if (!ref.current) {
    ref.current = new TourPrepper(options);
  }

  return ref.current;
}
