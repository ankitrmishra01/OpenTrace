import axios from "axios";

export const generateAIAnalysis = async (
  username,
  results,
  riskScore,
  riskBreakdown = [],
) => {
  try {
    const foundDetails = results
      .filter((r) => r.found)
      .map((r) => {
        const d = r.profileData || {};
        const details = Object.entries(d)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        return `- ${r.platform} (${r.confidence || "high"} confidence): ${details || "profile exists, no extra data"}`;
      })
      .join("\n");

    const breakdownText = (riskBreakdown || [])
      .map((b) => `- ${b.factor}: +${b.points} pts (${b.reason})`)
      .join("\n");

    const prompt = `You are a cybersecurity analyst reviewing an OSINT scan for username "${username}".

PLATFORMS FOUND:
${foundDetails || "None"}

RISK SCORE: ${riskScore}/100
SCORE BREAKDOWN:
${breakdownText || "None"}

Using ONLY the specific data above (do not invent details not listed), write:
### 1. EXPOSURE SUMMARY
2-3 sentences referencing the SPECIFIC fields found (e.g. name real disclosed fields like email, bio, or repos, not generic statements).

### 2. TOP 3 RISKS
Each risk must cite which specific platform/field it comes from.

### 3. RECOMMENDATIONS
3-4 tips tied directly to the specific exposures found, not generic advice.

### 4. VERDICT
One sentence verdict.

Format with clear ### headings.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    const text =
      response.data?.choices?.[0]?.message?.content || "Analysis unavailable.";
    return text;
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    return `### EXPOSURE SUMMARY\nBased on scan results for ${username}: Found on ${results.filter((r) => r.found).length} platform(s).\n\n### TOP 3 RISKS\n- Identified presence on multiple developer/social platforms.\n- Potential correlation across accounts.\n- Unlinked digital footprint.\n\n### RECOMMENDATIONS\n- Review privacy settings on disclosed profiles.\n- Ensure email addresses are kept private.\n- Audit public bio content.\n\n### VERDICT\nRisk score of ${riskScore}/100 calculated from verified platform exposures.`;
  }
};

export const synthesizeIdentityBio = async (username, results) => {
  try {
    const bios = results
      .filter((r) => r.found && r.profileData)
      .map((r) => {
        const pd = r.profileData;
        const b = pd.bio || pd.summary || pd.about_me || pd.about;
        const loc = pd.location;
        return `- ${r.platform}: ${b ? `Bio: "${b}"` : ""} ${loc ? `Location: "${loc}"` : ""}`;
      })
      .filter((line) => line.length > 20)
      .join("\n");

    if (!bios) return null;

    const prompt = `Synthesize a 2-3 sentence overview of who username "${username}" appears to be based strictly on these self-reported profile bios and locations:

${bios}

Cite which platform each key detail comes from (e.g., "backend developer per GitHub bio based in Seattle per Stack Overflow"). Do not invent details not present in the input. Keep it professional and concise.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    return response.data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.warn("Bio synthesis failed, falling back to manual merge:", error.message);
    return null;
  }
};

