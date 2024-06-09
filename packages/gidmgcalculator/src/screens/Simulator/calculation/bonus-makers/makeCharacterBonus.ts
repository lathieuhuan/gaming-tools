// import { AppliedBonus } from "@Src/backend/calculation/getCalculationStats/getCalculationStats.utils";
// import { CharacterBonusCore } from "@Src/backend/types";
// import { CalculationInfo, CharacterCalc, EntityCalc } from "@Src/backend/utils";
// import { toArray } from "@Src/utils";

// function getIntialBonusValue(
//   value: CharacterBonusCore["value"],
//   info: CalculationInfo,
//   inputs: number[],
//   fromSelf: boolean
// ) {
//   if (typeof value === "number") return value;
//   const { preOptions, options } = value;
//   let index = -1;

//   /** Navia */
//   if (preOptions && !inputs[1]) {
//     const preIndex = preOptions[inputs[0]];
//     index += preIndex ?? preOptions[preOptions.length - 1];
//   } else {
//     index = EntityCalc.getBonusValueOptionIndex(value, info, inputs);
//   }

//   if (value.extra && EntityCalc.isApplicableEffect(value.extra, info, inputs, fromSelf)) {
//     index += value.extra.value;
//   }
//   if (value.max) {
//     const max = EntityCalc.getMax(value.max, info, inputs, fromSelf);
//     if (index > max) index = max;
//   }

//   return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
// }

// function getBonus(
//   bonus: CharacterBonusCore,
//   totalAttrType: "ALL" | "STABLE",
//   info: CalculationInfo,
//   inputs: number[],
//   fromSelf = true
// ): AppliedBonus {
//   const { preExtra } = bonus;
//   let bonusValue = getIntialBonusValue(bonus.value, info, inputs, fromSelf);
//   let isStable = true;

//   // ========== APPLY LEVEL SCALE ==========
//   bonusValue *= CharacterCalc.getLevelScale(bonus.lvScale, info, inputs, fromSelf);

//   // ========== ADD PRE-EXTRA ==========
//   if (typeof preExtra === "number") {
//     bonusValue += preExtra;
//   } else if (preExtra && EntityCalc.isApplicableEffect(preExtra, info, inputs, fromSelf)) {
//     // if preExtra is not stable, this whole bonus is not stable
//     const { value, isStable: isStablePreExtra } = getBonus(preExtra, totalAttrType, info, inputs, fromSelf);
//     bonusValue += value;
//     if (!isStablePreExtra) isStable = false;
//   }

//   // ========== APPLY STACKS ==========
//   if (bonus.stacks) {
//     for (const stack of toArray(bonus.stacks)) {
//       if (["nation", "resolve"].includes(stack.type) && !info.partyData.length) {
//         return {
//           value: 0,
//           isStable: true,
//         };
//       }
//       bonusValue *= EntityCalc.getStackValue(stack, totalAttrType, info, inputs, fromSelf);

//       if (stack.type === "ATTRIBUTE") isStable = false;
//     }
//   }

//   // ========== APPLY MAX ==========
//   if (typeof bonus.max === "number") {
//     bonusValue = Math.min(bonusValue, bonus.max);
//   } else if (bonus.max) {
//     let finalMax = bonus.max.value;

//     if (bonus.max.stacks) {
//       finalMax *= EntityCalc.getStackValue(bonus.max.stacks, totalAttrType, info, inputs, fromSelf);
//     }
//     if (bonus.max.extras) {
//       finalMax += EntityCalc.getTotalExtraMax(bonus.max.extras, info, inputs, fromSelf);
//     }

//     bonusValue = Math.min(bonusValue, finalMax);
//   }

//   return {
//     value: bonusValue,
//     isStable,
//   };
// }
