import { createContext, useContext } from "react";
import { DefaultImageFallback } from "./DefaultImageFallback";

type RondConfig = {
  ImageFallback: (props: any) => React.JSX.Element | null;
};

const defaultConfig = {
  ImageFallback: DefaultImageFallback,
};

const RondConfigContext = createContext<RondConfig>(defaultConfig);

interface ConfigProviderProps {
  config: Partial<RondConfig>;
  children: React.ReactNode;
}
export function ConfigProvider(props: ConfigProviderProps) {
  return (
    <RondConfigContext.Provider value={{ ...defaultConfig, ...props.config }}>
      {props.children}
    </RondConfigContext.Provider>
  );
}

export function useRondConfig() {
  return useContext(RondConfigContext);
}
