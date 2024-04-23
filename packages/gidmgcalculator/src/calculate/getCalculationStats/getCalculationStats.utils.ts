type Stack = {
  type: string;
  field?: string;
};
export function isFinalBonus(bonusStacks?: Stack | Stack[]) {
  if (bonusStacks) {
    const isFinal = (stack: Stack) =>
      (stack.type === "ATTRIBUTE" && stack.field !== "base_atk") || stack.type === "BOL";
    return Array.isArray(bonusStacks) ? bonusStacks.some(isFinal) : isFinal(bonusStacks);
  }
  return false;
}
