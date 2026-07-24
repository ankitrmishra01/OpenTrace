// TODO: HIBP integration, requires paid key

export const calculateRiskScore = (results) => {
  if (!results || results.length === 0) return { score: 0, breakdown: [] };

  const breakdown = [];
  let score = 0;

  // 1. Cross-platform correlation risk (0-30 pts)
  const highConfidenceFound = results.filter(
    (r) => r.found && r.confidence === "high",
  ).length;
  const correlationPoints = Math.min(30, highConfidenceFound * 8);
  score += correlationPoints;
  breakdown.push({
    factor: "Cross-platform correlation",
    points: correlationPoints,
    reason: `Username verified present on ${highConfidenceFound} platform(s)`,
  });

  // 2. PII exposure (0-40 pts)
  let piiPoints = 0;
  const piiReasons = [];
  for (const r of results) {
    if (!r.found || !r.profileData) continue;
    if (r.profileData.email) {
      piiPoints += 15;
      piiReasons.push(`Public email on ${r.platform}`);
    }
    if (r.profileData.location) {
      piiPoints += 10;
      piiReasons.push(`Location disclosed on ${r.platform}`);
    }
    if (r.profileData.bio || r.profileData.about_me || r.profileData.summary || r.profileData.about) {
      piiPoints += 5;
      piiReasons.push(`Bio/about text on ${r.platform}`);
    }
  }
  piiPoints = Math.min(40, piiPoints);
  score += piiPoints;
  breakdown.push({
    factor: "PII exposure",
    points: piiPoints,
    reason: piiReasons.join("; ") || "None found",
  });

  // 3. Account activity / footprint depth (0-20 pts)
  let activityPoints = 0;
  for (const r of results) {
    if (!r.found || !r.profileData) continue;
    const pd = r.profileData;
    if ((pd.public_repos && pd.public_repos > 10) || (pd.karma && pd.karma > 500) || (pd.reputation && pd.reputation > 500)) {
      activityPoints += 7;
    }
  }
  activityPoints = Math.min(20, activityPoints);
  score += activityPoints;
  breakdown.push({
    factor: "Footprint depth/activity",
    points: activityPoints,
    reason: activityPoints > 0 ? "High-activity accounts increase identifiability" : "Standard activity footprint",
  });

  // 4. Low-confidence signal (0-10 pts)
  const lowConfidenceFound = results.filter((r) => r.found && r.confidence === "low").length;
  const lowConfPoints = Math.min(10, lowConfidenceFound * 3);
  score += lowConfPoints;
  breakdown.push({
    factor: "Unverified matches",
    points: lowConfPoints,
    reason: `${lowConfidenceFound} low-confidence match(es) — not independently verified`,
  });

  return {
    score: Math.min(100, Math.round(score)),
    breakdown,
  };
};

