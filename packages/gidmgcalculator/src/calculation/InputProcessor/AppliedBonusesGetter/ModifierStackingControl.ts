type StackableCheckCondition = {
  trackId?: string;
  paths: string | string[];
};

export class ModifierStackingControl {
  private usedMods: NonNullable<StackableCheckCondition>[] = [];

  isStackable = (condition: StackableCheckCondition) => {
    if (condition.trackId) {
      const isUsed = this.usedMods.some((usedMod) => {
        if (condition.trackId === usedMod.trackId && typeof condition.paths === typeof usedMod.paths) {
          if (Array.isArray(condition.paths)) {
            return (
              condition.paths.length === usedMod.paths.length &&
              condition.paths.every((target, i) => target === usedMod.paths[i])
            );
          }
          return condition.paths === usedMod.paths;
        }
        return false;
      });

      if (isUsed) return false;

      this.usedMods.push(condition);
    }
    return true;
  };
}
