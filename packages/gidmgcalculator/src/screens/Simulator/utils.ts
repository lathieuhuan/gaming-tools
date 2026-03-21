// TODO: see if we can move these utils

export function smoothValues(values: number[]) {
  let result = `${Math.round(values[0])}`;

  for (let i = 1; i < values.length; i++) {
    result += ` + ${Math.round(values[i])}`;
  }

  return result;
}
