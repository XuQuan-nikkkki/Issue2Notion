// import "dotenv/config";

import { config } from "../config";
import { fetchAllIssues } from "../utils/github";
import { createIssueInNotion, findOrCreateRepo } from "../utils/notion";

async function main() {
  const { owner, repo } = config.github;

  console.log(`📥 Fetching issues from ${owner}/${repo}...`);
  const issues = await fetchAllIssues();
  console.log(`✅ Fetched ${issues.length} issues in total.\n`);

  if (issues.length === 0) {
    return;
  }

  console.log(`🔎 Checking if repo 「${repo}」 exists in Notion...`);
  const repoDbId = await findOrCreateRepo();

  console.log("🔄 Syncing issues to Notion...");
  for (const [index, issue] of issues.entries()) {
    await createIssueInNotion(issue, repoDbId, index);
  }
  console.log("\n🎉 Done.");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
