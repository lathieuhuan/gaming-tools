import { useEffect } from "react";
import { ScreenSizeWatcher, SwitchNode } from "rond";

import { useSelector } from "@Store/hooks";
import {
  AppModals,
  // Message,
  // NavBar,
  // ScreenSizeWatcher,
  // SetupImportCenter,
  // SetupTransshipmentPort,
  // Tracker,
} from "@Src/features";
// import Calculator from "@Screens/Calculator";
// import MyArtifacts from "@Screens/MyArtifacts";
// import MyCharacters from "@Screens/MyCharacters";
// import MySetups from "@Screens/MySetups";
// import MyWeapons from "@Screens/MyWeapons";

function App() {
  const atScreen = useSelector((state) => state.ui.atScreen);

  useEffect(() => {
    const beforeunloadAlert = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = "Are you sure you want to exit?");
    };
    window.addEventListener("beforeunload", beforeunloadAlert, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", beforeunloadAlert, { capture: true });
    };
  }, []);

  return (
    <ScreenSizeWatcher>
      <div className="App h-screen pt-8 text-light-400 bg-light-400">
        {/* <NavBar /> */}

        <div className="h-full flex-center relative">
          {/* <Calculator /> */}

          {atScreen !== "CALCULATOR" ? (
            <div className="absolute full-stretch z-30">
              <SwitchNode
                value={atScreen}
                cases={
                  [
                    // { value: EScreen.MY_CHARACTERS, element: <MyCharacters /> },
                    // { value: EScreen.MY_WEAPONS, element: <MyWeapons /> },
                    // { value: EScreen.MY_ARTIFACTS, element: <MyArtifacts /> },
                    // { value: EScreen.MY_SETUPS, element: <MySetups /> },
                  ]
                }
              />
            </div>
          ) : null}
        </div>

        <AppModals />
        {/* <Tracker />
        <Message />
        <SetupTransshipmentPort />
        <SetupImportCenter /> */}
      </div>
    </ScreenSizeWatcher>
  );
}

export default App;
