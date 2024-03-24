import { useEffect } from "react";
import { SwitchNode } from "rond";

import { useSelector } from "@Store/hooks";
import { AppModals, NavBar, SetupImportCenter, SetupTransshipmentPort, Tracker } from "@Src/features";
import Calculator from "@Src/screens/Calculator";
import MyCharacters from "@Src/screens/MyCharacters";
import MyWeapons from "@Src/screens/MyWeapons";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MySetups from "@Src/screens/MySetups";

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
    <div className="App h-screen pt-8 text-light-default bg-light-default">
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
      <SetupTransshipmentPort />
      <SetupImportCenter />
    </div>
  );
}

export default App;
