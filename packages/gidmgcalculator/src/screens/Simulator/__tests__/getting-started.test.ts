import { test, expect } from "vitest";
import { $AppCharacter } from "@/services";

test("should have 7 characters", () => {
  expect($AppCharacter.getAll().length).toBe(7);
});