import { SearchParams } from "./types";

export function toSegments(path: string) {
  return path.split("/").filter(Boolean);
}

export function checkIsChildSegments(childSegments: string[], segments: string[]) {
  return childSegments.every((segment, index) => segment === segments[index]);
}

export function objectToSearchString(params: SearchParams) {
  return Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${v}`).join("&");
      }
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

    if (value === "true") {
      params[key] = true;
    } else if (value === "false") {
      params[key] = false;
    } else {
      const num = Number(value);
      const _value = isNaN(num) ? value : num;

      if (key in params) {
        const existValue = params[key];
        params[key] = Array.isArray(existValue) ? [...existValue, _value] : [existValue, _value];
      } else {
        params[key] = _value;
      }
    }
  }

  return params;
}
