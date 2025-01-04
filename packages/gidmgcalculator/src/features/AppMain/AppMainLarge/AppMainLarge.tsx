import { SwitchNode } from "rond";

import { useSelector } from "@Store/hooks";
import { ContextProvider, OptimizationDept } from "@Src/screens/Calculator";
import { MyCharactersLarge } from "@Src/screens/MyCharacters";
import MyWeapons from "@Src/screens/MyWeapons";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MySetups from "@Src/screens/MySetups";
import { CalculatorLarge } from "./CalculatorLarge";

export function AppMainLarge() {
  const atScreen = useSelector((state) => state.ui.atScreen);

  return (
    <div className="h-full flex-center relative">
      <ContextProvider>
        <OptimizationDept />
        <CalculatorLarge />
      </ContextProvider>

      {atScreen !== "CALCULATOR" ? (
        <div className="absolute full-stretch z-30">
          <SwitchNode
            value={atScreen}
            cases={[
              { value: "MY_CHARACTERS", element: <MyCharactersLarge /> },
              { value: "MY_WEAPONS", element: <MyWeapons /> },
              { value: "MY_ARTIFACTS", element: <MyArtifacts /> },
              { value: "MY_SETUPS", element: <MySetups /> },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
