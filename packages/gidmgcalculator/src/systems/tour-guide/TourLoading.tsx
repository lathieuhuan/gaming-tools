import { LoadingPlate } from "rond";

export function TourLoading() {
  return (
    <div className="absolute inset-0 bg-black/40 flex-center">
      <LoadingPlate />
    </div>
  );
}
