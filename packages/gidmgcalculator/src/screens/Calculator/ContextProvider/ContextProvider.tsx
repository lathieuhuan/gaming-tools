import { ReactNode } from "react";

import { ModalsProvider } from "./ModalsProvider";
import { SetupTransshiper } from "./SetupTransshiper";

export function ContextProvider(props: { children: ReactNode }) {
  return (
    <ModalsProvider>
      {props.children}
      <SetupTransshiper />
    </ModalsProvider>
  );
}
