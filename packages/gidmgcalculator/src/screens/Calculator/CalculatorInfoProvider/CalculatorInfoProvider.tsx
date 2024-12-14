import { useMemo } from "react";
import { $AppCharacter } from "@Src/services";
import { useSelector } from "@Store/hooks";
import { selectCharacter } from "@Store/calculator-slice";
import { CalculatorInfo, CalculatorInfoContext } from "./calculator-info-context";

interface CalculatorInfoProviderProps {
  children: React.ReactNode;
}
export function CalculatorInfoProvider({ children }: CalculatorInfoProviderProps) {
  const character = useSelector(selectCharacter);

  const calculatorInfo = useMemo<CalculatorInfo | null>(() => {
    return character?.name
      ? {
          appChar: $AppCharacter.get(character.name),
        }
      : null;
  }, [character?.name]);

  return <CalculatorInfoContext.Provider value={calculatorInfo}>{children}</CalculatorInfoContext.Provider>;
}
