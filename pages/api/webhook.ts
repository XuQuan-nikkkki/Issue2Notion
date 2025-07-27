import { NextApiRequest, NextApiResponse } from "next";
import { findOrCreateRepo, createIssueInNotion } from "../../utils/notion";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const event = req.headers["x-github-event"];
  const payload = req.body;

  if (event === "issues" && payload.action === "opened") {
    const { issue, repository } = payload;

    try {
      const repoName = repository.name;
      const repoOwner = repository.owner.login;

      const repoDbId = await findOrCreateRepo(repoName, repoOwner);
      const newPageId = await createIssueInNotion(issue, repoDbId, 0);
      return res.status(200).json({ success: true, pageId: newPageId });
    } catch (err) {
      console.error("Error creating issue in Notion:", err);
      return res.status(500).json({ error: "Failed to add issue to Notion" });
    }
  }

  return res.status(200).json({ received: true });
}
