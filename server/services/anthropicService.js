import axios from "axios";

export const generateAIAnalysis = async (username, results, riskScore) => {
  try {
    const found = results.filter((r) => r.found).map((r) => r.platform);
    const prompt = `You are a cybersecurity analyst. A user scanned the username "${username}" and found public profiles on: ${found.length > 0 ? found.join(", ") : "no platforms"}. The cyber risk score is ${riskScore}/100.

Generate a concise cyber risk analysis with:
1. EXPOSURE SUMMARY (2-3 sentences about their digital footprint)
2. TOP 3 RISKS (bullet points, specific to their findings)
3. RECOMMENDATIONS (3-4 actionable privacy tips)
4. VERDICT (one sentence summary)

Use cybersecurity terminology. Be specific, not generic. Format with clear headings using ### markers.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
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
    return `### AI ANALYSIS\nUnable to connect to AI engine. Please verify your API configuration.\n\n### MANUAL ASSESSMENT\nBased on scan results: Found on ${results.filter((r) => r.found).length}/${results.length} platforms. Risk Level: ${riskScore > 70 ? "HIGH" : riskScore > 30 ? "MODERATE" : "LOW"}.`;
  }
};
