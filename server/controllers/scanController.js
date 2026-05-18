import ScanResult from "../models/ScanResult.js";
import { scanPlatforms } from "../services/platformService.js";
import { generateAIAnalysis } from "../services/anthropicService.js";
import { calculateRiskScore } from "../utils/riskScorer.js";

export const startScan = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });
    }

    const results = await scanPlatforms(username);
    const riskScore = calculateRiskScore(results);
    const platformsFound = results.filter((r) => r.found).length;

    const scan = await ScanResult.create({
      userId,
      username,
      results,
      riskScore,
      platformsFound,
    });

    res.status(200).json({
      success: true,
      scan: {
        id: scan._id,
        username: scan.username,
        results: scan.results,
        riskScore: scan.riskScore,
        platformsFound: scan.platformsFound,
      },
    });
  } catch (error) {
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

    const aiAnalysis = await generateAIAnalysis(
      scan.username,
      scan.results,
      scan.riskScore,
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
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
