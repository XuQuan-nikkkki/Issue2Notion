import { Octokit } from "octokit";
import { config } from "../config";

const octokit = new Octokit({ auth: config.github.token });

export const fetchAllIssues = async () => {
  const { owner, repo } = config.github;

  const issues = [];
  let page = 1;

  while (true) {
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "all",
      page,
    });

    if (response.data.length === 0) break;

    const onlyIssues = response.data.filter(
      (issue: { pull_request?: unknown }) => !issue.pull_request
    );
    issues.push(...onlyIssues);
    console.log(`Fetched page ${page} with ${onlyIssues.length} issues.`);
    page++;
  }

  return issues;
};

export const fetchRepo = async (repo: string, owner: string) => {
  const response = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return response.data;
};
