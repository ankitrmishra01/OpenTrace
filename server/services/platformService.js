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
        found = false;
        note = "Cannot verify — LinkedIn blocks automated checks";
      } else if (platform.id === "twitter") {
        found = false;
        note = "Cannot verify — Twitter blocks automated checks";
      } else if (platform.id === "instagram") {
        found = false;
        note = "Cannot verify — Instagram blocks automated checks";
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
