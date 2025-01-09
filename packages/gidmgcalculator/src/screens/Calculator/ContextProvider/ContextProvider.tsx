import { CharacterDataProvider } from "./CharacterDataProvider";
import { ModalsProvider } from "./ModalsProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <CharacterDataProvider>
      <ModalsProvider>{props.children}</ModalsProvider>
    </CharacterDataProvider>
  );
}
