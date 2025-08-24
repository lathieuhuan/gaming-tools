import { SwitchNode, useScreenWatcher } from "rond";

import { useRouter } from "@Src/features/BrowserRouter";
import { useSelector } from "@Store/hooks";

// Screens
import { CalculatorLarge, CalculatorSmall } from "@Src/screens/Calculator";
import EnkaImport from "@Src/screens/EnkaImport";
import MyArtifacts from "@Src/screens/MyArtifacts";
import { MyCharactersLarge, MyCharactersSmall } from "@Src/screens/MyCharacters";
import MySetups from "@Src/screens/MySetups";
import MyWeapons from "@Src/screens/MyWeapons";

export function AppMain() {
  const screenWatcher = useScreenWatcher();
  const router = useRouter();
  const isMobile = !screenWatcher.isFromSize("sm");

  if (router.pathname === "/enka") {
    return <EnkaImport isMobile={isMobile} />;
  }

  return isMobile ? <AppMainSmall /> : <AppMainLarge />;
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
