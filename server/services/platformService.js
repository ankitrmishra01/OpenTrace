import axios from "axios";
import crypto from "crypto";

export const PLATFORMS = [
  {
    id: "github",
    name: "GitHub",
    icon: "⬡",
    color: "#58a6ff",
    checkUrl: (u) => `https://github.com/${u}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "◈",
    color: "#ff4500",
    checkUrl: (u) => `https://www.reddit.com/user/${u}`,
  },
  {
    id: "leetcode",
    name: "LeetCode",
    icon: "◆",
    color: "#ffa116",
    checkUrl: (u) => `https://leetcode.com/${u}`,
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    icon: "🥞",
    color: "#f48024",
    checkUrl: (u) => `https://stackoverflow.com/users/${u}`,
  },
  {
    id: "devto",
    name: "Dev.to",
    icon: "👩‍💻",
    color: "#0a0a0a",
    checkUrl: (u) => `https://dev.to/${u}`,
  },
  {
    id: "gravatar",
    name: "Gravatar",
    icon: "🌐",
    color: "#1e8cbe",
    checkUrl: (u) => `https://gravatar.com/${u}`,
  },
  {
    id: "hackernews",
    name: "HackerNews",
    icon: "Y",
    color: "#ff6600",
    checkUrl: (u) => `https://news.ycombinator.com/user?id=${u}`,
  },
];

export const MANUAL_PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "◇",
    color: "#1da1f2",
    checkUrl: (u) => `https://twitter.com/${u}`,
    note: "Manual check link (automated scraping deprecated due to anti-scraping)",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "◑",
    color: "#e1306c",
    checkUrl: (u) => `https://www.instagram.com/${u}`,
    note: "Manual check link (automated scraping deprecated due to anti-scraping)",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "◉",
    color: "#0077b5",
    checkUrl: (u) => `https://www.linkedin.com/in/${u}`,
    note: "Manual check link (unauthenticated scraping violates ToS)",
  },
];

export const scanPlatforms = async (username) => {
  const results = [];

  for (const platform of PLATFORMS) {
    try {
      let found = false;
      let profileData = null;
      let avatar = null;
      const confidence = "high";

      if (platform.id === "github") {
        try {
          const response = await axios.get(
            `https://api.github.com/users/${username}`,
            {
              headers: { Accept: "application/vnd.github.v3+json" },
              timeout: 5000,
            },
          );
          if (response.status === 200 && response.data) {
            found = true;
            const d = response.data;
            avatar = d.avatar_url || null;
            profileData = {
              name: d.name || null,
              bio: d.bio || null,
              company: d.company || null,
              location: d.location || null,
              blog: d.blog || null,
              twitter_username: d.twitter_username || null,
              public_repos: d.public_repos ?? 0,
              followers: d.followers ?? 0,
              created_at: d.created_at || null,
              email: d.email || null,
            };
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "reddit") {
        try {
          const response = await axios.get(
            `https://www.reddit.com/user/${username}/about.json`,
            {
              headers: { "User-Agent": "OpenTrace/1.0 OSINT Scanner" },
              timeout: 5000,
            },
          );
          if (response.status === 200 && response.data?.data && !response.data.data.is_suspended) {
            found = true;
            const d = response.data.data;
            avatar = d.icon_img ? d.icon_img.split("?")[0] : null;
            profileData = {
              name: d.name || null,
              created_utc: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : null,
              comment_karma: d.comment_karma ?? 0,
              link_karma: d.link_karma ?? 0,
              karma: (d.comment_karma || 0) + (d.link_karma || 0),
              is_gold: d.is_gold ?? false,
              has_verified_email: d.has_verified_email ?? false,
            };
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "leetcode") {
        try {
          const response = await axios.post(
            "https://leetcode.com/graphql",
            {
              query: `query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                  username
                  profile {
                    ranking
                    reputation
                    realName
                    userAvatar
                    aboutMe
                  }
                  submitStats {
                    acSubmissionNum {
                      count
                    }
                  }
                }
              }`,
              variables: { username },
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 5000,
            },
          );
          const matchedUser = response.data?.data?.matchedUser;
          if (matchedUser) {
            found = true;
            const p = matchedUser.profile || {};
            avatar = p.userAvatar || null;
            profileData = {
              username: matchedUser.username,
              name: p.realName || null,
              ranking: p.ranking || null,
              reputation: p.reputation || null,
              about_me: p.aboutMe || null,
            };
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "stackoverflow") {
        try {
          const response = await axios.get(
            `https://api.stackexchange.com/2.3/users?inname=${encodeURIComponent(username)}&site=stackoverflow`,
            { timeout: 5000 },
          );
          const items = response.data?.items || [];
          const matched = items.find(
            (item) => item.display_name?.toLowerCase() === username.toLowerCase(),
          );
          if (matched) {
            found = true;
            avatar = matched.profile_image || null;
            profileData = {
              display_name: matched.display_name,
              reputation: matched.reputation ?? 0,
              location: matched.location || null,
              about_me: matched.about_me || null,
              creation_date: matched.creation_date
                ? new Date(matched.creation_date * 1000).toISOString()
                : null,
              website_url: matched.website_url || null,
            };
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "devto") {
        try {
          const response = await axios.get(
            `https://dev.to/api/users/by_username?url=${encodeURIComponent(username)}`,
            { timeout: 5000 },
          );
          if (response.status === 200 && response.data && response.data.id) {
            found = true;
            const d = response.data;
            avatar = d.profile_image || null;
            profileData = {
              name: d.name || null,
              summary: d.summary || null,
              location: d.location || null,
              github_username: d.github_username || null,
              twitter_username: d.twitter_username || null,
              joined_at: d.joined_at || null,
              website_url: d.website_url || null,
            };
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "gravatar") {
        try {
          const hash = crypto
            .createHash("md5")
            .update(username.trim().toLowerCase())
            .digest("hex");
          const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;
          const response = await axios.get(avatarUrl, {
            timeout: 5000,
            validateStatus: (status) => status === 200 || status === 404,
          });
          if (response.status === 200) {
            found = true;
            avatar = avatarUrl;
            profileData = {
              email_hash: hash,
              registered: true,
            };
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "hackernews") {
        try {
          const response = await axios.get(
            `https://hacker-news.firebaseio.com/v0/user/${username}.json`,
            { timeout: 5000 },
          );
          if (response.status === 200 && response.data && response.data.id) {
            found = true;
            const d = response.data;
            profileData = {
              created: d.created ? new Date(d.created * 1000).toISOString() : null,
              karma: d.karma ?? 0,
              about: d.about || null,
            };
          }
        } catch (err) {
          found = false;
        }
      }

      results.push({
        platform: platform.name,
        id: platform.id,
        found,
        confidence,
        profileData,
        avatar,
        url: platform.checkUrl(username),
        color: platform.color,
        icon: platform.icon,
      });
    } catch (error) {
      results.push({
        platform: platform.name,
        id: platform.id,
        found: false,
        confidence: "high",
        profileData: null,
        avatar: null,
        url: platform.checkUrl(username),
        color: platform.color,
        icon: platform.icon,
      });
    }
  }

  return results;
};

