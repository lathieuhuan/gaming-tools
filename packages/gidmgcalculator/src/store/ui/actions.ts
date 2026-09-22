import type { SearchParams } from "@/lib/router";
import type { PartiallyOptional } from "rond";
import type { SetupImportMeta, SetupImportParams, TourType, UIState } from "./types";

import { useUIStore } from "./uiStore";

export const updateUI = (state: Partial<UIState>) => {
  useUIStore.setState(state);
};

export const updateEnkaParams = (params: SearchParams) => {
  useUIStore.setState({ enkaParams: params });
};

export const setTourType = (tourType: TourType | undefined) => {
  useUIStore.setState({ tourType });
};

export const sendToImportCenter = (
  params: SetupImportParams,
  meta: PartiallyOptional<SetupImportMeta, "id" | "name" | "type">,
) => {
  const { id = Date.now(), name = "Imported setup", type = "original" } = meta;

  useUIStore.setState({
    setupImportInfo: {
      meta: {
        id,
        name,
        type,
        source: meta.source,
      },
      params,
    },
  });
};
