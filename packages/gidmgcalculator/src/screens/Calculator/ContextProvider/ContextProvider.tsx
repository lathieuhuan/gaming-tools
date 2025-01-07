import { CharacterDataProvider } from "./CharacterDataProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizeDirectorProvider } from "./OptimizeDirectorProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <CharacterDataProvider>
      <OptimizeDirectorProvider>
        <ModalsProvider>{props.children}</ModalsProvider>
      </OptimizeDirectorProvider>
    </CharacterDataProvider>
  );
}
