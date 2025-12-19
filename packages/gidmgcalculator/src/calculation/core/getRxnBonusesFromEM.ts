export function getRxnBonusesFromEM(EM: number) {
  return {
    transformative: Math.round((16000 * EM) / (EM + 2000)) / 10,
    amplifying: Math.round((2780 * EM) / (EM + 1400)) / 10,
    lunar: Math.round((6000 * EM) / (EM + 2000)) / 10,
    quicken: Math.round((5000 * EM) / (EM + 1200)) / 10,
    shield: Math.round((4440 * EM) / (EM + 1400)) / 10,
  };
}
