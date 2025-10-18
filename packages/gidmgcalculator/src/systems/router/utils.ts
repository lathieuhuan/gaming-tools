import { SearchParams } from "./types";

export function toSegments(path: string) {
  return path.split("/").filter(Boolean);
}

export function checkIsChildSegments(childSegments: string[], segments: string[]) {
  return childSegments.every((segment, index) => segment === segments[index]);
}

export function objectToSearchString(params: Partial<SearchParams>) {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      // let valueString = value;

      // if (Array.isArray(value)) {
      //   valueString = value.map((v) => `${v}`).join(",");
      // }

      return `${key}=${value}`;
    })
    .join("&");
}

export function searchStringToObject(search: string): SearchParams {
  const params: SearchParams = {};

  for (const part of search.split("&")) {
    const [key, value = ""] = part.split("=");

    if (!key) {
      continue;
    }

    params[key] = value;
  }

  return params;
}
