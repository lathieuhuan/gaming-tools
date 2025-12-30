import { ReactNode } from "react";

import { BuildSaver } from "./BuildSaver";
import { ItemSaver } from "./ItemSaver";

export function DataSaver({ children }: { children: ReactNode }) {
  return (
    <BuildSaver>
      <ItemSaver>{children}</ItemSaver>
    </BuildSaver>
  );
}
