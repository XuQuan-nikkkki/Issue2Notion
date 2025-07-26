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
    token: requireEnv("GITHUB_TOKEN"),
    owner: requireEnv("GITHUB_OWNER"),
    repo: requireEnv("GITHUB_REPO"),
  },
  notion: {
    token: requireEnv("NOTION_TOKEN"),
    reposDbId: requireEnv("NOTION_REPOS_DB_ID"),
    rawIssuesDbId: requireEnv("NOTION_RAW_ISSUES_DB_ID"),
    repoTempatePageId: requireEnv("NOTION_REPO_TEMPLATE_PAGE_ID"),
    rawIssueTemplatePageId: requireEnv("NOTION_RAW_ISSUE_TEMPLATE_PAGE_ID"),
  },
};
