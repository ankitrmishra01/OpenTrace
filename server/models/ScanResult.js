import mongoose from "mongoose";

const ScanResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    results: [
      {
        platform: String,
        id: String,
        found: Boolean,
        confidence: String,
        profileData: Object,
        avatar: String,
        url: String,
        color: String,
        icon: String,
      },
    ],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskBreakdown: [Object],
    identityConfidence: {
      score: Number,
      evidence: [String],
    },
    identityCard: Object,
    scanDiff: Object,
    remediationChecklist: [Object],
    aiAnalysis: String,
    platformsFound: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ScanResult", ScanResultSchema);

