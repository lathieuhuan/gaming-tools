export * from "./CharacterOverview";
export * from "./Modifiers";
export * from "./FinalResult";
export * from "./SetupManager";
export * from "./SetupDirector";
export * from "./CalculatorModalsProvider";

import { CalculatorInfoProvider } from "./CalculatorInfoProvider";
import { CalculatorModalsProvider } from "./CalculatorModalsProvider";

interface CalculatorAllProvidersProps {
  children: React.ReactNode;
}
export function CalculatorProviders(props: CalculatorAllProvidersProps) {
  return (
    <CalculatorInfoProvider>
      <CalculatorModalsProvider>{props.children}</CalculatorModalsProvider>
    </CalculatorInfoProvider>
  );
}
