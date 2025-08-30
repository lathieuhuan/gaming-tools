import { EffectValueByOption, LevelableTalentType } from "@/calculation/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester, MutableTeamDataTester } from "@UnitTest/test-utils";
import { getIndexOfEffectValue } from "../getIndexOfEffectValue";

describe("getIndexOfEffectValue", () => {
  let teamData: MutableTeamDataTester;
  let optIndex: EffectValueByOption["optIndex"];
  let inputs: number[] = [];

  function __expect(value: number) {
    expect(getIndexOfEffectValue(optIndex, teamData, inputs, true)).toBe(value);
  }

  beforeEach(() => {
    teamData = __genMutableTeamDataTester();
    optIndex = undefined;
    inputs = [];
  });

  /**
   * @inpIndex the index of inputs to get value, when optIndex type INPUT
   */

  test("[DEFAULT] no optIndex: type INPUT, inpIndex is 0", () => {
    const input = 2;
    inputs = [input];
    optIndex = undefined;

    __expect(input - 1); // input 1 will be mapped to index 0, input 2 mapped to index 1, etc
  });

  test("optIndex config as number: type INPUT, optIndex is the inpIndex", () => {
    const input = 2;

    optIndex = 0;
    inputs = [input];
    __expect(input - 1);

    optIndex = 1;
    inputs = [-2, input];
    __expect(input - 1);

    optIndex = 1;
    inputs = [];
    __expect(-1);
  });

  test("[type: INPUT] get optIndex from inputs", () => {
    const input = 2;

    optIndex = {
      source: "INPUT",
      inpIndex: 0,
    };

    inputs = [input];
    __expect(input - 1);

    inputs = [];
    __expect(-1);
  });

  test("[type: LEVEL] get optIndex from character's talent level", () => {
    const level = 10;
    const talents: LevelableTalentType[] = ["NAs", "ES", "EB"];

    for (const talent of talents) {
      optIndex = {
        source: "LEVEL",
        talent: talent,
      };
      teamData.__updateActiveMember({ [talent]: level });
      __expect(level - 1);
    }
  });

  test("[type: ELEMENT] get optIndex from the number of the team's all distinct elements", () => {
    optIndex = {
      source: "ELEMENT",
    };

    teamData.__changeActiveMember(__EMockCharacter.BASIC);
    __expect(0);

    teamData.__changeTeammates([__EMockCharacter.PYRO]);
    __expect(0);

    teamData.__changeTeammates([__EMockCharacter.CATALYST]);
    __expect(1);
  });

  test("[type: ELEMENT] get optIndex from the number of the team's some distinct elements (ELEMENT)", () => {
    optIndex = {
      source: "ELEMENT",
      elements: ["pyro"],
    };

    teamData.__changeActiveMember(__EMockCharacter.BASIC);
    __expect(0);

    teamData.__changeTeammates([__EMockCharacter.CATALYST]);
    __expect(0);

    optIndex.elements = ["pyro", "electro"];
    __expect(1);

    optIndex.elements = ["pyro", "electro", "anemo"];
    __expect(1);
  });

  test("[type: MEMBER] get optIndex from the number of teammates whose elements are different from the character", () => {
    const electroMember = __EMockCharacter.CATALYST;

    optIndex = {
      source: "MEMBER",
      element: "DIFFERENT",
    };

    teamData.__changeActiveMember(__EMockCharacter.BASIC);
    __expect(-1);

    teamData.__changeTeammates([electroMember]);
    __expect(0);

    teamData.__changeTeammates([electroMember, __EMockCharacter.BASIC]);
    __expect(0);

    teamData.__changeTeammates([electroMember, __EMockCharacter.TARTAGLIA]);
    __expect(1);
  });

  test("optIndex from the number of WHOLE team's members whose elements are aligned with the condition (MEMBER)", () => {
    const electroMember = __EMockCharacter.CATALYST;
    const pyroMember = __EMockCharacter.BASIC;

    optIndex = {
      source: "MEMBER",
      element: "pyro",
    };

    teamData.__changeActiveMember(__EMockCharacter.BASIC);
    __expect(0);

    teamData.__changeTeammates([pyroMember]);
    __expect(1);

    teamData.__changeTeammates([pyroMember, electroMember]);
    __expect(1);

    optIndex.element = ["pyro", "electro"];
    __expect(2);
  });
});
