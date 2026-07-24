// NOTE: sharp is a native binary dependency.
// On cloud hostings (e.g., Render free tier), verify sharp support or rely on the graceful fallback below
// which skips image comparison seamlessly without failing scans if sharp or image decoding fails.

import axios from "axios";

export const calculateIdentityConfidence = async (username, results) => {
  const foundResults = results.filter((r) => r.found);
  if (foundResults.length <= 1) {
    return {
      score: 100,
      evidence: ["Single platform found — no cross-platform identity ambiguity."],
    };
  }

  let score = 20; // baseline score for matching username across platforms
  const evidence = [`Base match: exact username "${username}" across ${foundResults.length} platforms.`];

  // 1. Cross-linked Handles (explicit reciprocal links)
  let explicitLinksCount = 0;
  for (const r of foundResults) {
    const pd = r.profileData;
    if (!pd) continue;

    if (pd.twitter_username && pd.twitter_username.toLowerCase() === username.toLowerCase()) {
      explicitLinksCount++;
      evidence.push(`Explicit cross-link: Twitter handle listed on ${r.platform}`);
    }
    if (pd.github_username && pd.github_username.toLowerCase() === username.toLowerCase()) {
      explicitLinksCount++;
      evidence.push(`Explicit cross-link: GitHub handle listed on ${r.platform}`);
    }
  }

  if (explicitLinksCount > 0) {
    const crossPoints = Math.min(40, explicitLinksCount * 25);
    score += crossPoints;
  }

  // 2. Avatar / Profile Image Correlation
  const avatarUrls = foundResults
    .map((r) => ({ platform: r.platform, avatar: r.avatar }))
    .filter((a) => a.avatar && a.avatar.startsWith("http"));

  if (avatarUrls.length >= 2) {
    try {
      // Attempt image hash correlation; fallback gracefully if sharp or image fetching fails
      let sharp = null;
      try {
        sharp = (await import("sharp")).default;
      } catch (err) {
        // sharp optional fallback
      }

      if (sharp) {
        const hashes = [];
        for (const item of avatarUrls.slice(0, 3)) {
          try {
            const imgRes = await axios.get(item.avatar, {
              responseType: "arraybuffer",
              timeout: 3000,
            });
            const buffer = Buffer.from(imgRes.data);
            const rawPixels = await sharp(buffer)
              .resize(8, 8, { fit: "fill" })
              .grayscale()
              .raw()
              .toBuffer();

            let sum = 0;
            for (let i = 0; i < rawPixels.length; i++) sum += rawPixels[i];
            const avg = sum / rawPixels.length;

            let hashStr = "";
            for (let i = 0; i < rawPixels.length; i++) {
              hashStr += rawPixels[i] >= avg ? "1" : "0";
            }
            hashes.push({ platform: item.platform, hashStr });
          } catch (err) {
            // Ignore single image failure
          }
        }

        if (hashes.length >= 2) {
          // Compare Hamming distance
          let h1 = hashes[0].hashStr;
          let h2 = hashes[1].hashStr;
          let diff = 0;
          for (let i = 0; i < h1.length; i++) {
            if (h1[i] !== h2[i]) diff++;
          }
          if (diff <= 10) {
            score += 30;
            evidence.push(`Avatar similarity match between ${hashes[0].platform} and ${hashes[1].platform} (Hamming distance ${diff}/64).`);
          }
        }
      } else {
        // Fallback: Check if avatar URL structure or direct URL match
        if (avatarUrls[0].avatar === avatarUrls[1].avatar) {
          score += 25;
          evidence.push(`Identical avatar URL found on ${avatarUrls[0].platform} and ${avatarUrls[1].platform}`);
        }
      }
    } catch (avatarError) {
      // Gracefully continue without avatar comparison
    }
  }

  // 3. Bio & Location Text Similarity
  const locations = foundResults
    .map((r) => r.profileData?.location)
    .filter(Boolean);
  if (locations.length >= 2) {
    const loc1 = locations[0].toLowerCase().trim();
    const loc2 = locations[1].toLowerCase().trim();
    if (loc1.includes(loc2) || loc2.includes(loc1)) {
      score += 15;
      evidence.push(`Matching location metadata ("${locations[0]}") across accounts.`);
    }
  }

  return {
    score: Math.min(100, Math.round(score)),
    evidence,
  };
};
