import { memo } from "react";
import { useSelector } from "@Store/hooks";
import { selectActiveSimulation } from "@Store/simulator-slice";

// Components
import { SimulatorModalsProvider, ToolboxProvider } from "../SimulatorProviders";
import { MemberDetail, SimulatorHeader } from "../simulator-sections";

function SimulatorLargeCore() {
  const activeSimulation = useSelector(selectActiveSimulation);

  return (
    <SimulatorModalsProvider>
      <div className="h-full bg-surface-2">
        <SimulatorHeader />

        {activeSimulation ? (
          <ToolboxProvider>
            <div className="w-76">
              <MemberDetail />
            </div>
          </ToolboxProvider>
        ) : null}
      </div>
      <RenderLast />
    </SimulatorModalsProvider>
  );
}

const RenderLast = () => {
  console.log("====================");

  return null;
};

export const SimulatorLarge = memo(SimulatorLargeCore);
