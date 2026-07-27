import { createContext, useContext } from "react";
import { DefaultImageFallback } from "./DefaultImageFallback";
import type { DefaultImageFallbackProps } from "./types";

type RondConfig = {
  ImageFallback: React.ComponentType<DefaultImageFallbackProps>;
};

const defaultConfig = {
  ImageFallback: DefaultImageFallback,
};

const RondConfigContext = createContext<RondConfig>(defaultConfig);

type ConfigProviderProps = {
  config: Partial<RondConfig>;
  children: React.ReactNode;
};

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
