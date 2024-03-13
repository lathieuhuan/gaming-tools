import CommonTranslationEN from "./en/common.json";
import ResistanceTranslationEN from "./en/resistance.json";

export type NameSpace = "common" | "resistance";

export const resources: Record<NameSpace, Record<string, string>> = {
  common: CommonTranslationEN,
  resistance: ResistanceTranslationEN,
};
