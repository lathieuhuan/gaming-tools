export const API_URL = {
  base: "https://gidmgcalculator.vercel.app/api",
  allData() {
    return `${this.base}/meta-data`;
  },
  character: {
    byName: (name: string) => `${API_URL.base}/character?name=${name}`,
  },
  weapon: {
    byCode: (code: number) => `${API_URL.base}/weapon?code=${code}`,
  },
};

export const GENSHIN_DEV_URL = {
  base: "https://genshin.jmp.blue",
  character: (name: string) => `${GENSHIN_DEV_URL.base}/characters/${name}`,
};
