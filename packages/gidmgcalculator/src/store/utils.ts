import { current } from "@reduxjs/toolkit";

export const logStore = (store: any) => {
  try {
    console.log(current(store));
  } catch (error) {
    console.log(store);
  }
};
