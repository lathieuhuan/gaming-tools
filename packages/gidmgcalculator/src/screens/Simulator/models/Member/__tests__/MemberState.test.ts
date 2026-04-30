import { afterEach, describe, expect, test } from "vitest";

import { Ascendable } from "@/models/Ascendable";
import { MemberState } from "../MemberState";

const resetMemberStateDefaults = () => {
  MemberState.configure({
    defaultLevel: "1/20",
    defaultNAs: 1,
    defaultES: 1,
    defaultEB: 1,
    defaultCons: 0,
    defaultEnhanced: false,
  });
};

describe("MemberState", () => {
  afterEach(() => {
    resetMemberStateDefaults();
  });

  describe("constructor", () => {
    test("applies built-in defaults when init is empty", () => {
      const state = new MemberState();

      expect(state.level).toBe("1/20");
      expect(state.NAs).toBe(1);
      expect(state.ES).toBe(1);
      expect(state.EB).toBe(1);
      expect(state.cons).toBe(0);
      expect(state.enhanced).toBe(false);
    });

    test("sets bareLv and ascension from level via Ascendable", () => {
      const state = new MemberState({ level: "80/90" });
      const split = Ascendable.splitLevel("80/90");

      expect(state.bareLv).toBe(split.bareLv);
      expect(state.ascension).toBe(split.ascension);
    });

    test("merges partial init with defaults for omitted fields", () => {
      const state = new MemberState({ cons: 3 });

      expect(state.cons).toBe(3);
      expect(state.level).toBe("1/20");
      expect(state.NAs).toBe(1);
      expect(state.enhanced).toBe(false);
    });

    test("accepts a full CharacterStateData-shaped init", () => {
      const state = new MemberState({
        level: "50/60",
        NAs: 6,
        ES: 8,
        EB: 9,
        cons: 2,
        enhanced: true,
      });

      expect(state.level).toBe("50/60");
      expect(state.NAs).toBe(6);
      expect(state.ES).toBe(8);
      expect(state.EB).toBe(9);
      expect(state.cons).toBe(2);
      expect(state.enhanced).toBe(true);
    });
  });

  describe("update", () => {
    test("patches only provided fields and leaves others unchanged", () => {
      const state = new MemberState({
        level: "1/20",
        NAs: 5,
        ES: 4,
        EB: 3,
        cons: 1,
        enhanced: true,
      });

      state.update({ NAs: 10 });

      expect(state.NAs).toBe(10);
      expect(state.ES).toBe(4);
      expect(state.EB).toBe(3);
      expect(state.cons).toBe(1);
      expect(state.enhanced).toBe(true);
      expect(state.level).toBe("1/20");
    });

    test("recomputes bareLv and ascension when level changes", () => {
      const state = new MemberState({ level: "1/20" });
      state.update({ level: "50/60" });

      const split = Ascendable.splitLevel("50/60");
      expect(state.level).toBe("50/60");
      expect(state.bareLv).toBe(split.bareLv);
      expect(state.ascension).toBe(split.ascension);
    });

    test("does not touch bareLv or ascension when level is omitted", () => {
      const state = new MemberState({ level: "20/40" });
      const prevBare = state.bareLv;
      const prevAsc = state.ascension;

      state.update({ NAs: 2 });

      expect(state.bareLv).toBe(prevBare);
      expect(state.ascension).toBe(prevAsc);
    });

    test("returns the same instance", () => {
      const state = new MemberState();
      expect(state.update({ cons: 4 })).toBe(state);
    });
  });

  describe("configure", () => {
    test("changes defaults used by the parameterless constructor", () => {
      MemberState.configure({
        defaultLevel: "20/40",
        defaultNAs: 7,
        defaultES: 8,
        defaultEB: 9,
        defaultCons: 4,
        defaultEnhanced: true,
      });

      const state = new MemberState();

      expect(state.level).toBe("20/40");
      expect(state.NAs).toBe(7);
      expect(state.ES).toBe(8);
      expect(state.EB).toBe(9);
      expect(state.cons).toBe(4);
      expect(state.enhanced).toBe(true);
    });

    test("preserves a default when its key is omitted from configure", () => {
      MemberState.configure({ defaultCons: 5 });

      const state = new MemberState();

      expect(state.cons).toBe(5);
      expect(state.level).toBe("1/20");
    });
  });
});
