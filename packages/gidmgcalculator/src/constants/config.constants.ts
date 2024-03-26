export const MAX_USER_WEAPONS = 200;
export const MAX_USER_ARTIFACTS = 800;
export const MAX_USER_SETUPS = 50;
export const MAX_CALC_SETUPS = 4;
export const INVENTORY_PAGE_SIZE = 60;

export const GENSHIN_DEV_URL = {
  base: "https://genshin.jmp.blue",
  character: (name: string) => `${GENSHIN_DEV_URL.base}/characters/${name}`,
};

export const BACKEND_URL = {
  base: import.meta.env.DEV ? "http://localhost:3000/api" : "https://gidmgcalculator-lathieuhuan.vercel.app/api",
  metadata() {
    return `${this.base}/meta-data`;
  },
  character: {
    byName: (name: string) => `${BACKEND_URL.base}/character?name=${name}`,
  },
  weapon: {
    byCode: (code: number) => `${BACKEND_URL.base}/weapon?code=${code}`,
  },
};
