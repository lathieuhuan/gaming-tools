import { resources, NameSpace } from "@/locales/i18n";

interface TranslateConfig {
  ns?: NameSpace;
}

export function useTranslation() {
  const t = (origin: string, config?: TranslateConfig) => {
    const { ns = "common" } = config || {};

    return resources[ns][origin] || origin;
  };

  return { t };
}
