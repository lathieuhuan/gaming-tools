import { ICharacterBasic, ITargetBasic } from "@/types";
import Object_ from "@/utils/Object";

export const pickBasicCharProps = (char: ICharacterBasic): ICharacterBasic => {
  return Object_.pickProps(char, ["name", "level", "NAs", "ES", "EB", "cons", "enhanced"]);
};

export const pickBasicTargetProps = (target: ITargetBasic): ITargetBasic => {
  return Object_.pickProps(target, ["code", "level", "variantType", "inputs", "resistances"]);
};
