import { ModifierStackingControl } from "../../applied-bonuses-getter";

test("path: string", () => {
  const modStackingCtrl = new ModifierStackingControl();

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: "abc",
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_2",
      paths: "abc",
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: "xyz",
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: "abc",
    })
  ).toBe(false);
});

test("path: string[]", () => {
  const modStackingCtrl = new ModifierStackingControl();

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: ["abc", "xyz"],
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_2",
      paths: ["abc", "xyz"],
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: ["xyz", "abc"], // different order is accepted
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: ["abc", "xyz"],
    })
  ).toBe(false);
});

test("path: string | string[]", () => {
  const modStackingCtrl = new ModifierStackingControl();

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: "abc",
    })
  ).toBe(true);

  expect(
    modStackingCtrl.isStackable({
      trackId: "tracked_1",
      paths: ["abc", "xyz"],
    })
  ).toBe(true);
});
