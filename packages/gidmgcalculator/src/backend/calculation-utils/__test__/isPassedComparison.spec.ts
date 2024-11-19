import { isPassedComparison } from "../isPassedComparison";

test("EQUAL comparision", () => {
  expect(isPassedComparison(2, 2)).toBe(true);
  expect(isPassedComparison(2, 2, "EQUAL")).toBe(true);
  expect(isPassedComparison(2, 1, "EQUAL")).toBe(false);
  expect(isPassedComparison(2, 3, "EQUAL")).toBe(false);
});

test("MIN comparision", () => {
  expect(isPassedComparison(2, 2, "MIN")).toBe(true);
  expect(isPassedComparison(2, 1, "MIN")).toBe(true);
  expect(isPassedComparison(2, 3, "MIN")).toBe(false);
});

test("MAX comparision", () => {
  expect(isPassedComparison(2, 2, "MAX")).toBe(true);
  expect(isPassedComparison(2, 1, "MAX")).toBe(false);
  expect(isPassedComparison(2, 3, "MAX")).toBe(true);
});