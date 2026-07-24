export const REMEDIATION_LINKS = {
  github: {
    hideEmail: "https://github.com/settings/emails",
    reviewProfile: "https://github.com/settings/profile",
  },
  reddit: {
    clearHistory: "https://www.reddit.com/settings/privacy-and-security",
  },
  leetcode: {
    editProfile: "https://leetcode.com/profile/",
  },
  stackoverflow: {
    editVisibility: "https://stackoverflow.com/users/edit-profile-picture",
  },
  devto: {
    accountSettings: "https://dev.to/settings",
  },
  gravatar: {
    manageAvatars: "https://gravatar.com/emails",
  },
  hackernews: {
    editProfile: "https://news.ycombinator.com/user",
  },
};

export const getRemediationChecklist = (results) => {
  const checklist = [];

  for (const r of results) {
    if (!r.found) continue;
    const platformId = r.id;
    const links = REMEDIATION_LINKS[platformId];
    if (!links) continue;

    const pd = r.profileData || {};
    if (pd.email && links.hideEmail) {
      checklist.push({
        platform: r.platform,
        issue: "Public Email Disclosed",
        action: "Configure email privacy settings on GitHub",
        link: links.hideEmail,
      });
    }
    if (pd.location && (links.reviewProfile || links.editVisibility || links.accountSettings)) {
      checklist.push({
        platform: r.platform,
        issue: "Location Disclosed",
        action: "Review or clear public location field",
        link: links.reviewProfile || links.editVisibility || links.accountSettings || links.editProfile,
      });
    }
    if ((pd.bio || pd.summary || pd.about_me || pd.about) && (links.reviewProfile || links.accountSettings || links.editProfile)) {
      checklist.push({
        platform: r.platform,
        issue: "Public Bio / About Me",
        action: "Review personal bio for sensitive details",
        link: links.reviewProfile || links.accountSettings || links.editProfile,
      });
    }
  }

  return checklist;
};
