export * from "./PanelAttributes";
export * from "./PanelGears";
export * from "./PanelConstellation";
export * from "./PanelTalents";

import { MyCharacterDetailInfoProvider } from "./MyCharacterDetailInfoProvider";
import { MyCharacterDetailModalsProvider } from "./MyCharacterDetailModalsProvider";

export function MyCharacterDetailProviders(props: { children: React.ReactNode }) {
  return (
    <MyCharacterDetailInfoProvider>
      <MyCharacterDetailModalsProvider>{props.children}</MyCharacterDetailModalsProvider>
    </MyCharacterDetailInfoProvider>
  );
}
