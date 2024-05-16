import { useMemo } from "react";
import { $AppCharacter } from "@Src/services";
import { CalculatorInfo, CalculatorInfoContext } from "./calculator-info-context";

interface CalculatorInfoProviderProps {
  characterName: string;
  children: React.ReactNode;
}
export function CalculatorInfoProvider({ characterName, children }: CalculatorInfoProviderProps) {
  const calculatorInfo = useMemo<CalculatorInfo | null>(() => {
    return characterName
      ? {
          appChar: $AppCharacter.get(characterName),
        }
      : null;
  }, [characterName]);

  return <CalculatorInfoContext.Provider value={calculatorInfo}>{children}</CalculatorInfoContext.Provider>;
}
