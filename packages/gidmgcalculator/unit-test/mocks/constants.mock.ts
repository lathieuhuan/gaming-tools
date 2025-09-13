export const IS_DEV_ENV = true;

export const BACKEND_URL = {
  base: "http://localhost:3000/api",
  allData() {
    return `${this.base}/meta-data`;
  },
  character: {
    byName: (name: string) => `${BACKEND_URL.base}/character?name=${name}`,
  },
  weapon: {
    byCode: (code: number) => `${BACKEND_URL.base}/weapon?code=${code}`,
  },
};
