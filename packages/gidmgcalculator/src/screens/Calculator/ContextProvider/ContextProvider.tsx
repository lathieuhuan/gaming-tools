import { CharacterDataProvider, PartyDataProvider } from "./DataProvider";
import { ModalsProvider } from "./ModalsProvider";

export function ContextProvider(props: { children: React.ReactElement }) {
  return (
    <CharacterDataProvider>
      <PartyDataProvider>
        <ModalsProvider>{props.children}</ModalsProvider>
      </PartyDataProvider>
    </CharacterDataProvider>
  );
}
