export * from "./CharacterOverview";
export * from "./Modifiers";
export * from "./FinalResult";
export * from "./SetupManager";
export * from "./SetupDirector";
export * from "./CalculatorModalsProvider";

import { useSelector } from "@Store/hooks";
import { selectCharacter } from "@Store/calculator-slice";
import { CalculatorInfoProvider } from "./CalculatorInfoProvider";
import { CalculatorModalsProvider } from "./CalculatorModalsProvider";

interface CalculatorAllProvidersProps {
  children: React.ReactNode;
}
export function CalculatorProviders(props: CalculatorAllProvidersProps) {
  const char = useSelector(selectCharacter);

  return (
    <CalculatorInfoProvider characterName={char?.name}>
      <CalculatorModalsProvider>{props.children}</CalculatorModalsProvider>
    </CalculatorInfoProvider>
  );
}
