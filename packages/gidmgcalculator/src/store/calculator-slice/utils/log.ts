import { current } from "@reduxjs/toolkit";

export function log(object: any) {
  try {
    console.log(current(object));
  } catch {
    console.log(object);
  }
}
