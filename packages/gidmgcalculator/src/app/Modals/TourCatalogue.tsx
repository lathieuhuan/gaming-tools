import { Button, Checkbox } from "rond";

import type { TourKey } from "@/types";

import { TOURS } from "@/systems/tour-operator";
import { useToursStore } from "@Store/tours";
import { setTourFinished } from "@Store/tours/actions";
import { setTourType } from "@Store/ui";

type TourCatalogueProps = {
  onStartTour?: () => void;
};

export function TourCatalogue({ onStartTour }: TourCatalogueProps) {
  const finishedTours = useToursStore((state) => state.finishedTours);

  const handleStartTour = (key: TourKey) => {
    setTourType(key);
    onStartTour?.();
  };

  return (
    <div>
      {TOURS.map((tour) => (
        <div key={tour.key} className="p-3 bg-dark-1 rounded-md">
          <p className="text-lg font-semibold">{tour.title}</p>
          <p className="text-sm text-light-4">{tour.description}</p>

          <div className="mt-2 flex items-center justify-between">
            <Checkbox
              checked={!!finishedTours[tour.key]}
              onChange={(checked) => setTourFinished(tour.key, checked)}
            >
              Finished
            </Checkbox>

            <Button
              size="small"
              className="ml-auto shrink-0"
              onClick={() => handleStartTour(tour.key)}
            >
              Start
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
