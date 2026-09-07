import { current } from "@reduxjs/toolkit";

export const logStore = (store: any) => {
  try {
    console.info(current(store));
  } catch (error) {
    console.info(store);
  }
};
