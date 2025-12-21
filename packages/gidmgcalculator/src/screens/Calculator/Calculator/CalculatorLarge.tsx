import { memo } from "react";
import { useScreenWatcher } from "rond";

import { useCalcStore } from "@Store/calculator";

// Components
import { Card } from "../_components/Card";
import { ContextProvider } from "../ContextProvider";
import { ModifiersCard, OverviewCard, ResultsCard, SetupCard } from "./_cards";

const FlexibleCard: typeof Card = ({ className, style, ...restProps }) => {
  const comparedCount = useCalcStore((state) => state.comparedIds.length);
  const screenWatcher = useScreenWatcher();
  const isHugeScreen = screenWatcher.isFromSize("2xl");

  let width = 22;

  if (comparedCount > 1) {
    width += (comparedCount - 1) * 2;
  }

  return (
    <Card
      className={["transition-size duration-200", className]}
      style={{
        ...style,
        width: `${width}rem`,
        maxWidth: isHugeScreen ? "30rem" : "22rem",
      }}
      {...restProps}
    />
  );
};

function LargeCalculator() {
  const touched = useCalcStore((state) => state.setupManagers.length !== 0);

  return (
    <ContextProvider>
      <div className="flex flex-col relative max-w-98/100 2xl:max-w-none h-full sm:h-[calc(100vh_-_3rem)]">
        <div className="grow flex items-center overflow-auto snap-x snap-mandatory sm:snap-none">
          <div className="w-full flex h-98/100 gap-2">
            <OverviewCard touched={touched} />
            <ModifiersCard touched={touched} />
            <SetupCard touched={touched} />
            <ResultsCard touched={touched} className="pt-2" CardComponent={FlexibleCard} />
          </div>
        </div>
      </div>
    </ContextProvider>
  );
}

export const CalculatorLarge = memo(LargeCalculator);
