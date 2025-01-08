import { CharacterDataProvider } from "./CharacterDataProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizeSystemProvider } from "./OptimizeSystemProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <CharacterDataProvider>
      <OptimizeSystemProvider>
        <ModalsProvider>{props.children}</ModalsProvider>
      </OptimizeSystemProvider>
    </CharacterDataProvider>
  );
}
