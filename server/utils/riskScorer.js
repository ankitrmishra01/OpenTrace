export const calculateRiskScore = (results) => {
  if (!results || results.length === 0) return 0;

  const foundCount = results.filter((r) => r.found).length;
  const platformCount = results.length;

  let score = 0;

  score += (foundCount / platformCount) * 40;
  score += foundCount > 1 ? 20 : 0;
  score += foundCount > 2 ? 30 : 0;

  return Math.min(100, Math.round(score + Math.random() * 10));
};
