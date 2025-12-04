import { IS_DEV_ENV } from "@/constants";

export function getImgSrc(src?: string) {
  // const IS_DEV_ENV = false;
  if (IS_DEV_ENV || !src) return "";

  const isFromWiki = src.split("/")[0].length === 1;
  return isFromWiki ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
}
