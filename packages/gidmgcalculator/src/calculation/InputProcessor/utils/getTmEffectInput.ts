export const getTmEffectInput = (config: { altIndex?: number }, inputs: number[] = []) => {
  const { altIndex = 0 } = config;
  return inputs[altIndex] ?? 0;
};