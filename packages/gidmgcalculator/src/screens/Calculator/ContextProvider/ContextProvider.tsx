import { ReactNode } from "react";

import { ModalsProvider } from "./ModalsProvider";
import { SetupTransshiper } from "./SetupTransshiper";
import { TeamDataProvider } from "./TeamDataProvider";

export function ContextProvider(props: { children: ReactNode }) {
  return (
    <TeamDataProvider>
      <ModalsProvider>
        {props.children}
        <SetupTransshiper />
      </ModalsProvider>
    </TeamDataProvider>
  );
}
