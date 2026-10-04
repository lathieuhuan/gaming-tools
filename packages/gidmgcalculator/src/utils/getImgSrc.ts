import { IS_DEV_ENV } from "@/constants/config";

export function getImgSrc(src: string) {
  // const IS_DEV_ENV = false;
  if (IS_DEV_ENV) return "";

  if (src.startsWith("https")) {
    return src;
  }

  const end = src.includes("?") ? src : `${src}.png`;

  return `https://static.wikia.nocookie.net/gensin-impact/images/${end}`;
}
