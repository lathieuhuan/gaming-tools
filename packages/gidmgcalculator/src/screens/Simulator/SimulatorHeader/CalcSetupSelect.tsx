import { Modal } from "rond";
import { CalcSetup } from "@Src/types";
import { useStoreSnapshot } from "@Src/features";

type SetupOption = CalcSetup & {
  id: number;
  name: string;
};

interface CalcSetupSelectProps {
  onSelect: (setup: SetupOption) => void;
}
export function CalcSetupSelect(props: CalcSetupSelectProps) {
  const setups = useStoreSnapshot((state) => {
    const { setupManageInfos, setupsById } = state.calculator;
    return setupManageInfos.map<SetupOption>((info) => ({
      id: info.ID,
      name: info.name,
      ...setupsById[info.ID],
    }));
  });

  return (
    <>
      <Modal.Header withDivider>Select Setup</Modal.Header>

      <div>
        {setups.map((setup) => {
          return (
            <div key={setup.id} className="px-2 py-1 rounded w-fit bg-surface-3" onClick={() => props.onSelect(setup)}>
              {setup.name}
            </div>
          );
        })}
      </div>
    </>
  );
}
