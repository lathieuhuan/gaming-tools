export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

export function logSection(title: string, ...details: [string, unknown][]) {
  console.info(`** ${title}`);

  for (const [key, value] of details) {
    console.info(key, value == null ? "null" : value);
  }
}
