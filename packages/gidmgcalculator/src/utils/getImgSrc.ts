export function getImgSrc(src?: string) {
  if (!src) return "";

  const isFromWiki = src.split("/")[0].length === 1;
  return isFromWiki ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
}
