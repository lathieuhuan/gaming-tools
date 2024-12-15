export * from "./CharacterOverview";
export * from "./Modifiers";
export * from "./FinalResult";
export * from "./SetupManager";
export * from "./SetupDirector";
export * from "./CalculatorModalsProvider";

import { CharacterDataProvider, PartyDataProvider } from "./CalculatorDataProvider";
import { CalculatorModalsProvider } from "./CalculatorModalsProvider";

interface CalculatorAllProvidersProps {
  children: React.ReactNode;
}
export function CalculatorProviders(props: CalculatorAllProvidersProps) {
  return (
    <CharacterDataProvider>
      <PartyDataProvider>
        <CalculatorModalsProvider>{props.children}</CalculatorModalsProvider>
      </PartyDataProvider>
    </CharacterDataProvider>
  );
}
