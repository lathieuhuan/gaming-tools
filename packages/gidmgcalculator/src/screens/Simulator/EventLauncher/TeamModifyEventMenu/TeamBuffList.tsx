import { parseDescription } from "@/utils/descriptionParsers";
import { selectProcessor, selectSimulation, useSimulatorStore } from "../../store";

import { triggerTeamBuffEvent, updateTeamInputs } from "../../actions/build";
import { EventTrigger } from "../components/EventTrigger";

export function TeamBuffList() {
  const team = useSimulatorStore((state) => selectProcessor(state).team);
  const teamInputs = useSimulatorStore((state) => selectSimulation(state).teamInputs);

  const handleInputChange = (id: number, inputIndex: number, value: number) => {
    updateTeamInputs(id, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (modId: number, inputs: number[]) => {
    triggerTeamBuffEvent({
      modId,
      inputs,
    });
  };

  return (
    <div className="space-y-2">
      {team.state.teamBuffs.map((spec) => {
        const inputs = teamInputs[spec.id] || [];

        return (
          <EventTrigger
            key={spec.id}
            heading={spec.src}
            description={parseDescription(spec.description)}
            inputConfigs={spec.inputConfigs}
            inputs={inputs}
            onInputChange={(inputIndex, value) => handleInputChange(spec.id, inputIndex, value)}
            onTrigger={() => handleTrigger(spec.id, inputs)}
          />
        );
      })}
    </div>
  );
}
