import { FaCalculator, FaSyncAlt } from "react-icons/fa";
import { Button } from "rond";

import type { CalcTeammate } from "@/models/calculator";

import { CharacterPortrait, TeammateItems } from "@/components";

type TeammateDetailProps = {
  teammate: CalcTeammate;
  calculated: boolean;
  onSwitch: () => void;
  onCalculate: () => void;
};

export function TeammateDetail({
  teammate,
  calculated,
  onSwitch,
  onCalculate,
}: TeammateDetailProps) {
  const data = teammate.data;

  return (
    <div className="w-76 bg-dark-2">
      <div className="pl-4 pt-4 pr-6 flex items-start">
        <CharacterPortrait info={data} />
        <p className={`px-4 text-2xl text-${data.vision} font-bold`}>{teammate.name}</p>
      </div>

      <div className="py-4">
        <TeammateItems className="p-4 bg-dark-1" teammate={teammate} />

        <div className="mt-4 flex justify-center">
          {calculated ? (
            <Button
              variant="primary"
              className="flex items-center"
              icon={<FaSyncAlt />}
              onClick={onSwitch}
            >
              Switch
            </Button>
          ) : (
            <Button
              variant="primary"
              className="flex items-center"
              icon={<FaCalculator />}
              onClick={onCalculate}
            >
              Calculate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
