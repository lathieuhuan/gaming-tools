import { useUIStore } from "@Store/ui";
import { TourOperator as Operator } from "./TourOperator";

// Lazy load the Operator if needed

export function TourOperator() {
  const tourType = useUIStore((state) => state.tourType);

  return tourType && <Operator tourType={tourType} />;
}

export { TOURS } from "./_tours/catalogue";
