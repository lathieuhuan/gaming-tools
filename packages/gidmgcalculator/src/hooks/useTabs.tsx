import { useState } from "react";
import { Tabs, TabsProps } from "rond";

export function useTabs(initialActiveIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const tabProps = {
    activeIndex,
    onClickTab: setActiveIndex,
  } satisfies TabsProps;

  return {
    activeIndex,
    tabProps,
    setActiveIndex,
    Tabs,
  };
}
