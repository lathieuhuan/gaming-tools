import { useMemo } from "react";
import { Modal } from "rond";
import { useStore } from "@Src/features";
import { CalcSetup } from "@Src/types";

interface CalcSetupSelectProps {
  onSelect: (setup: CalcSetup) => void;
}
export function CalcSetupSelect(props: CalcSetupSelectProps) {
  const store = useStore();

  const setups = useMemo(() => {
    const { setupManageInfos, setupsById } = store.select((state) => state.calculator);
    return setupManageInfos.map((info) => ({
      id: info.ID,
      name: info.name,
      ...setupsById[info.ID],
    }));
  }, []);

  const onClickSetup = (setup: CalcSetup) => {
    props.onSelect(setup);
  };

  return (
    <>
      <Modal.Header withDivider>Select Setup</Modal.Header>

      <div>
        <p onClick={() => onClickSetup({} as any)}>Shortcut</p>
        {setups.map((setup) => {
          return (
            <div key={setup.id} className="px-2 py-1 rounded w-fit bg-surface-3" onClick={() => onClickSetup(setup)}>
              {setup.name}
            </div>
          );
        })}
      </div>
    </>
  );
}
