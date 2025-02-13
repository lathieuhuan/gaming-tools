import { SwitchNode, useScreenWatcher } from "rond";

import { useSelector } from "@Store/hooks";

// Screens
import { CalculatorLarge, CalculatorSmall } from "@Src/screens/Calculator";
import { MyCharactersLarge, MyCharactersSmall } from "@Src/screens/MyCharacters";
import MyWeapons from "@Src/screens/MyWeapons";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MySetups from "@Src/screens/MySetups";

export function AppMain() {
  const screenWatcher = useScreenWatcher();
  return screenWatcher.isFromSize("sm") ? <AppMainLarge /> : <AppMainSmall />;
}

function AppMainLarge() {
  const atScreen = useSelector((state) => state.ui.atScreen);

  return (
    <div className="h-full flex-center relative">
      <CalculatorLarge />

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

function AppMainSmall() {
  const atScreen = useSelector((state) => state.ui.atScreen);

  return (
    <SwitchNode
      value={atScreen}
      cases={[
        { value: "MY_CHARACTERS", element: <MyCharactersSmall /> },
        { value: "MY_WEAPONS", element: <MyWeapons /> },
        { value: "MY_ARTIFACTS", element: <MyArtifacts /> },
        { value: "MY_SETUPS", element: <MySetups /> },
      ]}
      default={<CalculatorSmall />}
    />
  );
}
