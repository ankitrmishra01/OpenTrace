export const buildIdentityCard = (results, bioSynthesis = null) => {
  const found = results.filter((r) => r.found);
  if (found.length === 0) {
    return null;
  }

  // 1. Name variants & primary name
  const nameCounts = {};
  const nameSources = {};
  for (const r of found) {
    const name = r.profileData?.name || r.profileData?.display_name;
    if (name) {
      const trimmed = name.trim();
      nameCounts[trimmed] = (nameCounts[trimmed] || 0) + 1;
      if (!nameSources[trimmed]) nameSources[trimmed] = [];
      nameSources[trimmed].push(r.platform);
    }
  }

  const nameVariants = Object.keys(nameCounts).map((name) => ({
    name,
    count: nameCounts[name],
    platforms: nameSources[name],
  }));

  const primaryName = nameVariants.sort((a, b) => b.count - a.count)[0]?.name || null;

  // 2. Locations
  const locationMap = {};
  for (const r of found) {
    const loc = r.profileData?.location;
    if (loc) {
      const trimmed = loc.trim();
      if (!locationMap[trimmed]) locationMap[trimmed] = [];
      locationMap[trimmed].push(r.platform);
    }
  }
  const locations = Object.keys(locationMap).map((loc) => ({
    location: loc,
    platforms: locationMap[loc],
  }));

  // 3. Social & External Links
  const linkCounts = {};
  const linkPlatforms = {};
  for (const r of found) {
    const pd = r.profileData || {};
    const candidateLinks = [
      pd.blog,
      pd.website_url,
      pd.twitter_username ? `https://twitter.com/${pd.twitter_username}` : null,
      pd.github_username ? `https://github.com/${pd.github_username}` : null,
    ].filter(Boolean);

    for (const link of candidateLinks) {
      const normalized = link.trim().replace(/\/$/, "");
      linkCounts[normalized] = (linkCounts[normalized] || 0) + 1;
      if (!linkPlatforms[normalized]) linkPlatforms[normalized] = [];
      linkPlatforms[normalized].push(r.platform);
    }
  }

  const knownLinks = Object.keys(linkCounts).map((url) => ({
    url,
    confirmed: linkPlatforms[url].length >= 2,
    platforms: linkPlatforms[url],
  }));

  // 4. Earliest online date
  let earliestDate = null;
  for (const r of found) {
    const pd = r.profileData || {};
    const dStr = pd.created_at || pd.created_utc || pd.creation_date || pd.joined_at || pd.created;
    if (dStr) {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        if (!earliestDate || d < earliestDate) {
          earliestDate = d;
        }
      }
    }
  }

  // 5. Bios collection for fallback synthesis
  const bios = found
    .map((r) => {
      const pd = r.profileData || {};
      const bioText = pd.bio || pd.summary || pd.about_me || pd.about;
      return bioText ? `${r.platform}: "${bioText}"` : null;
    })
    .filter(Boolean);

  const consolidatedBio = bioSynthesis || (bios.length > 0 ? bios.join(" | ") : "No bio details available across profiles.");

  return {
    primaryName,
    nameVariants,
    locations,
    consolidatedBio,
    knownLinks,
    earliestOnline: earliestDate ? earliestDate.toISOString() : null,
  };
};
