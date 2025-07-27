import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  github: {
    get token() {
      return requireEnv("GITHUB_TOKEN");
    },
    get owner() {
      return requireEnv("GITHUB_OWNER");
    },
    get repo() {
      return requireEnv("GITHUB_REPO");
    },
  },
  notion: {
    get token() {
      return requireEnv("NOTION_TOKEN");
    },
    get reposDbId() {
      return requireEnv("NOTION_REPOS_DB_ID");
    },
    get rawIssuesDbId() {
      return requireEnv("NOTION_RAW_ISSUES_DB_ID");
    },
    get repoTempatePageId() {
      return requireEnv("NOTION_REPO_TEMPLATE_PAGE_ID");
    },
    get rawIssueTemplatePageId() {
      return requireEnv("NOTION_RAW_ISSUE_TEMPLATE_PAGE_ID");
    },
  },
};
