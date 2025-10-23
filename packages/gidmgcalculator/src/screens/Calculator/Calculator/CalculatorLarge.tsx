import { CSSProperties, memo, ReactNode } from "react";
import { useScreenWatcher } from "rond";

import { selectComparedIds } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { getCards } from "./config";

// Components
import { ContextProvider } from "../ContextProvider";
import { Card } from "./Card";

function LargeCalculator() {
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);

  const Cards = getCards({ touched });

  return (
    <div className="flex flex-col relative max-w-98/100 2xl:max-w-none h-full sm:h-[calc(100vh_-_3rem)]">
      <div className="grow flex items-center overflow-auto snap-x snap-mandatory sm:snap-none">
        <div className="w-full flex h-98/100 gap-2">
          {Cards.Overview()}
          {Cards.Modifiers()}
          {Cards.Setup()}

          <FlexibleWrapper>
            {({ className, style }) =>
              Cards.Results({
                className: ["pt-2 relative", className],
                style,
                placeholder: <Card dark={3} />,
              })
            }
          </FlexibleWrapper>
        </div>
      </div>
    </div>
  );
}

type FlexibleWrapperRenderProps = {
  className?: string;
  style?: CSSProperties;
};

const FlexibleWrapper = (props: { children: (props: FlexibleWrapperRenderProps) => ReactNode }) => {
  const comparedCount = useSelector(selectComparedIds).length;
  const screenWatcher = useScreenWatcher();
  const isHugeScreen = screenWatcher.isFromSize("2xl");

  let width = 22;

  if (comparedCount > 1) {
    width += (comparedCount - 1) * 2;
  }

  return props.children({
    className: "transition-size duration-200",
    style: {
      width: `${width}rem`,
      maxWidth: isHugeScreen ? "30rem" : "22rem",
    },
  });
};

export const CalculatorLarge = memo(() => {
  return (
    <ContextProvider>
      <LargeCalculator />
    </ContextProvider>
  );
});
