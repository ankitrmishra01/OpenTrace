// TODO: full HIBP breach-by-email requires a paid API key (~$3.50/mo as of 2026) — evaluate later

import axios from "axios";
import crypto from "crypto";

export const getEmailBreaches = async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "User email not found on profile" });
    }

    try {
      const response = await axios.get(
        `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          timeout: 8000,
        },
      );

      if (response.data && response.data.breaches && Array.isArray(response.data.breaches[0])) {
        const breachNames = response.data.breaches[0];
        return res.status(200).json({
          success: true,
          email,
          exposed: breachNames.length > 0,
          breachesCount: breachNames.length,
          breaches: breachNames.map((name) => ({
            name,
          })),
        });
      } else if (response.data && response.data.ExposedBreaches) {
        const breachesData = response.data.ExposedBreaches[0] || {};
        const breachNames = Object.keys(breachesData);
        return res.status(200).json({
          success: true,
          email,
          exposed: breachNames.length > 0,
          breachesCount: breachNames.length,
          breaches: breachNames.map((name) => ({
            name,
            details: breachesData[name],
          })),
        });
      } else {
        return res.status(200).json({
          success: true,
          email,
          exposed: false,
          breachesCount: 0,
          breaches: [],
        });
      }
    } catch (apiErr) {
      if (apiErr.response?.status === 404) {
        return res.status(200).json({
          success: true,
          email,
          exposed: false,
          breachesCount: 0,
          breaches: [],
        });
      }
      throw apiErr;
    }
  } catch (error) {
    console.error("Account security email breach check error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to verify email breach status at this time.",
    });
  }
};


export const checkPasswordLeak = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required for leak check" });
    }

    // SHA-1 hash of password
    const sha1Hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // K-Anonymity range API call (only 5 chars sent)
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { timeout: 8000 },
    );

    const lines = response.data.split("\n");
    let matchCount = 0;

    for (const line of lines) {
      const [lineSuffix, countStr] = line.trim().split(":");
      if (lineSuffix === suffix) {
        matchCount = parseInt(countStr, 10) || 0;
        break;
      }
    }

    res.status(200).json({
      success: true,
      leaked: matchCount > 0,
      count: matchCount,
      sha1Prefix: prefix,
    });
  } catch (error) {
    console.error("Pwned password check error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to complete password leakage check.",
    });
  }
};
