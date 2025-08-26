import { useScreenWatcher } from "rond";

import { CalculatorLarge, CalculatorSmall } from "@Src/screens/Calculator";

export function Main() {
  const screenWatcher = useScreenWatcher();
  const isMobile = !screenWatcher.isFromSize("sm");

  return isMobile ? (
    <CalculatorSmall />
  ) : (
    <div className="h-full flex-center relative">
      <CalculatorLarge />
    </div>
  );

  // if (isMobile) {
  //   return (
  //     <SwitchNode
  //       value={atScreen}
  //       cases={[
  //         { value: "MY_CHARACTERS", element: <MyCharactersSmall /> },
  //         { value: "MY_WEAPONS", element: <MyWeapons /> },
  //         { value: "MY_ARTIFACTS", element: <MyArtifacts /> },
  //         { value: "MY_SETUPS", element: <MySetups /> },
  //       ]}
  //       default={<CalculatorSmall />}
  //     />
  //   );
  // }

  // return (
  //   <div className="h-full flex-center relative">
  //     <CalculatorLarge />

  //     {atScreen !== "CALCULATOR" ? (
  //       <div className="absolute full-stretch z-30">
  //         <SwitchNode
  //           value={atScreen}
  //           cases={[
  //             { value: "MY_CHARACTERS", element: <MyCharactersLarge /> },
  //             { value: "MY_WEAPONS", element: <MyWeapons /> },
  //             { value: "MY_ARTIFACTS", element: <MyArtifacts /> },
  //             { value: "MY_SETUPS", element: <MySetups /> },
  //           ]}
  //         />
  //       </div>
  //     ) : null}
  //   </div>
  // );
}
