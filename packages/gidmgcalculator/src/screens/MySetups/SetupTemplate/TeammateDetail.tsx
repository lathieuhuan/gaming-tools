import { FaCalculator, FaSyncAlt } from "react-icons/fa";
import { Button } from "rond";

import type { Teammate } from "@Src/types";
import { $AppCharacter } from "@Src/services";

// Component
import { CharacterPortrait, TeammateItems } from "@Src/components";

interface TeammateDetailProps {
  teammate: Teammate;
  isCalculated: boolean;
  onSwitchSetup: () => void;
  onCalculateTeammateSetup: () => void;
}
export function TeammateDetail({
  teammate,
  isCalculated,
  onSwitchSetup,
  onCalculateTeammateSetup,
}: TeammateDetailProps) {
  const data = $AppCharacter.get(teammate.name);
  if (!data) return null;

  return (
    <div className="w-75 bg-dark-700">
      <div className="pl-4 pt-4 pr-6 flex items-start">
        <CharacterPortrait info={data} />
        <p className={`px-4 text-2xl text-${data.vision} font-bold`}>{teammate.name}</p>
      </div>

      <div className="py-4">
        <TeammateItems className="p-4 bg-dark-900" teammate={teammate} />

        <div className="mt-4 flex justify-center">
          {isCalculated ? (
            <Button variant="primary" className="flex items-center" icon={<FaSyncAlt />} onClick={onSwitchSetup}>
              Switch
            </Button>
          ) : (
            <Button
              variant="primary"
              className="flex items-center"
              icon={<FaCalculator />}
              onClick={onCalculateTeammateSetup}
            >
              Calculate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
