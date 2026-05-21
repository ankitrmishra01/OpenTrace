import axios from "axios";

const PLATFORMS = [
  {
    id: "github",
    name: "GitHub",
    icon: "⬡",
    color: "#58a6ff",
    checkUrl: (u) => `https://github.com/${u}`,
    avatarApi: (u) => `https://github.com/${u}.png?size=80`,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "◈",
    color: "#ff4500",
    checkUrl: (u) => `https://www.reddit.com/user/${u}`,
    avatarApi: null,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "◉",
    color: "#0077b5",
    checkUrl: (u) => `https://www.linkedin.com/in/${u}`,
    avatarApi: null,
  },
  {
    id: "leetcode",
    name: "LeetCode",
    icon: "◆",
    color: "#ffa116",
    checkUrl: (u) => `https://leetcode.com/${u}`,
    avatarApi: null,
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "◇",
    color: "#1da1f2",
    checkUrl: (u) => `https://twitter.com/${u}`,
    avatarApi: null,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "◑",
    color: "#e1306c",
    checkUrl: (u) => `https://www.instagram.com/${u}`,
    avatarApi: null,
  },
];

export const scanPlatforms = async (username) => {
  const results = [];

  for (const platform of PLATFORMS) {
    try {
      let found = false;
      let avatar = null;
      let note = null;

      if (platform.id === "github") {
        try {
          const response = await axios.get(
            `https://api.github.com/users/${username}`,
            {
              headers: { Accept: "application/vnd.github.v3+json" },
              timeout: 5000,
            },
          );
          found = response.status === 200;
          if (found && platform.avatarApi) {
            avatar = platform.avatarApi(username);
          }
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "reddit") {
        try {
          const response = await axios.get(
            `https://www.reddit.com/user/${username}/about.json`,
            {
              headers: { "User-Agent": "OpenTrace/1.0" },
              timeout: 5000,
            },
          );
          found = response.status === 200 && !response.data?.data?.is_suspended;
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "leetcode") {
        try {
          const response = await axios.post(
            "https://leetcode.com/graphql",
            {
              query: `{ matchedUser(username: "${username}") { username } }`,
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 5000,
            },
          );
          found = !!response.data?.data?.matchedUser;
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "linkedin") {
        try {
          const response = await axios.get(
            `https://www.linkedin.com/in/${username}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                DNT: "1",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
              },
              timeout: 10000,
              validateStatus: () => true,
              maxRedirects: 0,
            },
          );
          // LinkedIn returns 200 for valid profiles, 404 for not found, 999 for blocked requests
          // Redirect (30x) to login means profile might exist but requires auth
          found =
            response.status === 200 ||
            (response.status >= 300 && response.status < 400);
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "twitter") {
        try {
          const response = await axios.get(`https://twitter.com/${username}`, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 5000,
            validateStatus: () => true,
          });
          found = response.status === 200 && response.data.includes("account");
        } catch (err) {
          found = false;
        }
      } else if (platform.id === "instagram") {
        try {
          const response = await axios.get(
            `https://www.instagram.com/${username}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              timeout: 5000,
              validateStatus: () => true,
            },
          );
          found =
            response.status === 200 && response.data.includes("instagram");
        } catch (err) {
          found = false;
        }
      }

      results.push({
        platform: platform.name,
        id: platform.id,
        found,
        avatar,
        note,
        url: platform.checkUrl(username),
        color: platform.color,
        icon: platform.icon,
      });
    } catch (error) {
      results.push({
        platform: platform.name,
        id: platform.id,
        found: false,
        avatar: null,
        note: null,
        url: platform.checkUrl(username),
        color: platform.color,
        icon: platform.icon,
      });
    }
  }

  return results;
};
