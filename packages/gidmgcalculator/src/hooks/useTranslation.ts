import { resources, NameSpace } from "@Src/locales/i18n";

interface TranslateConfig {
  ns?: NameSpace;
}

export const useTranslation = () => {
  const t = (origin: string, config?: TranslateConfig) => {
    const { ns = "common" } = config || {};

    return resources[ns][origin] || origin;
  };

  return { t };
};
