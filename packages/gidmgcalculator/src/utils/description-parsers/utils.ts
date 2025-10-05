const typeToCls: Record<string, string> = {
  k: "text-bonus", // key
  v: "text-bonus font-bold", // value
  m: "text-max", // max
  n: "text-light-hint", // note
  ms: "text-primary-1", // milestone
  anemo: "text-anemo",
  cryo: "text-cryo",
  dendro: "text-dendro",
  electro: "text-electro",
  geo: "text-geo",
  hydro: "text-hydro",
  pyro: "text-pyro",
};

export const wrapText = (text: string | number, type = "") => {
  return `<span class="${typeToCls[type] || ""}">${text}</span>`;
};
