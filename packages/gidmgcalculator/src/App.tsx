import { useEffect } from "react";
import { SwitchNode } from "rond";

import { useSelector } from "@Store/hooks";
import {
  AppModals,
  // Message,
  NavBar,
  SetupImportCenter,
  SetupTransshipmentPort,
  Tracker,
} from "@Src/features";
import Calculator from "@Src/screens/Calculator";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MyCharacters from "@Src/screens/MyCharacters";
import MySetups from "@Src/screens/MySetups";
import MyWeapons from "@Src/screens/MyWeapons";

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
    <div className="App h-screen pt-8 text-light-400 bg-light-400">
      <NavBar />

      <div className="h-full flex-center relative">
        <Calculator />

        {atScreen !== "CALCULATOR" ? (
          <div className="absolute full-stretch z-30">
            <SwitchNode
              value={atScreen}
              cases={[
                { value: "MY_CHARACTERS", element: <MyCharacters /> },
                { value: "MY_WEAPONS", element: <MyWeapons /> },
                { value: "MY_ARTIFACTS", element: <MyArtifacts /> },
                { value: "MY_SETUPS", element: <MySetups /> },
              ]}
            />
          </div>
        ) : null}
      </div>

      <AppModals />
      <Tracker />
      {/* <Message /> */}
      <SetupTransshipmentPort />
      <SetupImportCenter />
    </div>
  );
}

export default App;
