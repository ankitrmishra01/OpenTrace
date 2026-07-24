// NOTE: Performing bio synthesis (Part 7) and risk AI analysis (Part 3) creates two Groq API calls per scan against the free tier 30 req/min limit.

import ScanResult from "../models/ScanResult.js";
import { scanPlatforms, MANUAL_PLATFORMS } from "../services/platformService.js";
import { generateAIAnalysis, synthesizeIdentityBio } from "../services/anthropicService.js";
import { calculateRiskScore } from "../utils/riskScorer.js";
import { calculateIdentityConfidence } from "../utils/identityConfidence.js";
import { buildIdentityCard } from "../utils/identityAggregator.js";
import { getRemediationChecklist } from "../data/remediationLinks.js";

export const startScan = async (req, res) => {
  try {
    const { username, checkPermutations } = req.body;
    const userId = req.user.id;

    if (!username || !username.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });
    }

    const cleanUsername = username.trim();
    const cacheWindowMinutes = 15;
    const cacheWindowStart = new Date(Date.now() - cacheWindowMinutes * 60 * 1000);

    // 1. Check Cache Guard (within last 15 minutes)
    const recentScan = await ScanResult.findOne({
      userId,
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
      createdAt: { $gte: cacheWindowStart },
    }).sort({ createdAt: -1 });

    if (recentScan) {
      return res.status(200).json({
        success: true,
        cached: true,
        scan: recentScan,
        manualPlatforms: MANUAL_PLATFORMS,
      });
    }

    // 2. Perform fresh scan
    const results = await scanPlatforms(cleanUsername);

    // Optional Permutations scan (opt-in)
    let permutationMatches = [];
    if (checkPermutations) {
      const permutations = [
        `${cleanUsername}_`,
        `${cleanUsername}.dev`,
        `the${cleanUsername}`,
        `${cleanUsername}123`,
      ];
      for (const perm of permutations) {
        const permRes = await scanPlatforms(perm);
        const founds = permRes.filter((r) => r.found);
        for (const f of founds) {
          permutationMatches.push({
            permutation: perm,
            platform: f.platform,
            url: f.url,
            confidence: "low",
          });
        }
      }
    }

    // 3. Risk Score calculation
    const riskObj = calculateRiskScore(results);
    const platformsFound = results.filter((r) => r.found).length;

    // 4. Identity Linkage Confidence
    const identityConfidence = await calculateIdentityConfidence(cleanUsername, results);

    // 5. Bio Overview Synthesis (Groq call #1)
    const bioOverview = await synthesizeIdentityBio(cleanUsername, results);

    // 6. Unified Identity Card construction
    const identityCard = buildIdentityCard(results, bioOverview);

    // 7. Remediation Checklist
    const remediationChecklist = getRemediationChecklist(results);

    // 8. Scan Diff Calculation (Baseline must be older than cacheWindowStart)
    const baseline = await ScanResult.findOne({
      userId,
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
      createdAt: { $lt: cacheWindowStart },
    }).sort({ createdAt: -1 });

    let scanDiff = null;
    if (baseline) {
      const currentFound = new Set(results.filter((r) => r.found).map((r) => r.id));
      const baselineFound = new Set((baseline.results || []).filter((r) => r.found).map((r) => r.id));

      const newFound = [...currentFound].filter((x) => !baselineFound.has(x));
      const disappeared = [...baselineFound].filter((x) => !currentFound.has(x));

      scanDiff = {
        hasChanges: newFound.length > 0 || disappeared.length > 0,
        newFound: newFound.map((id) => results.find((r) => r.id === id)?.platform || id),
        disappeared: disappeared.map((id) => baseline.results.find((r) => r.id === id)?.platform || id),
        baselineDate: baseline.createdAt,
      };
    }

    // 9. Save Scan Result to MongoDB
    const scan = await ScanResult.create({
      userId,
      username: cleanUsername,
      results,
      riskScore: riskObj.score,
      riskBreakdown: riskObj.breakdown,
      identityConfidence,
      identityCard,
      scanDiff,
      remediationChecklist,
      platformsFound,
    });

    res.status(200).json({
      success: true,
      cached: false,
      scan,
      permutationMatches,
      manualPlatforms: MANUAL_PLATFORMS,
    });
  } catch (error) {
    console.error("Error in startScan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateAnalysis = async (req, res) => {
  try {
    const { scanId } = req.body;

    const scan = await ScanResult.findById(scanId);
    if (!scan) {
      return res
        .status(404)
        .json({ success: false, message: "Scan not found" });
    }

    // Groq call #2
    const aiAnalysis = await generateAIAnalysis(
      scan.username,
      scan.results,
      scan.riskScore,
      scan.riskBreakdown,
    );

    scan.aiAnalysis = aiAnalysis;
    await scan.save();

    res.status(200).json({
      success: true,
      analysis: aiAnalysis,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getScanHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const scans = await ScanResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      scans: scans.map((scan) => ({
        id: scan._id,
        username: scan.username,
        riskScore: scan.riskScore,
        platformsFound: scan.platformsFound,
        date: scan.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getScanResult = async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await ScanResult.findById(scanId);
    if (!scan) {
      return res
        .status(404)
        .json({ success: false, message: "Scan not found" });
    }

    res.status(200).json({
      success: true,
      scan,
      manualPlatforms: MANUAL_PLATFORMS,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

