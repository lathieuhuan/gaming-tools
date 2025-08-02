const typeToCls: Record<string, string> = {
  k: "text-bonus-color", // key
  v: "text-bonus-color font-bold", // value
  m: "text-danger-max", // max
  n: "text-hint-color", // note
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
