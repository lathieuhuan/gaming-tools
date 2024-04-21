export * from "./PanelAttributes";
export * from "./PanelGears";
export * from "./PanelConstellation";
export * from "./PanelTalents";

import { CharacterInfoProvider } from "./CharacterInfoProvider";
import { CharacterInfoModalsProvider } from "./CharacterInfoModalsProvider";

export function CharacterInfoAllProviders(props: { children: React.ReactNode }) {
  return (
    <CharacterInfoProvider>
      <CharacterInfoModalsProvider>{props.children}</CharacterInfoModalsProvider>
    </CharacterInfoProvider>
  );
}
