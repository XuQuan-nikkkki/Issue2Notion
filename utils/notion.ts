import { Client, PageObjectResponse } from "@notionhq/client";
import { config } from "../config";
import { GithubIssue } from "./types";
import { fetchRepo } from "./github";

const notion = new Client({ auth: config.notion.token });

export const _queryInDatabase = async (databaseId: string, filter?: any) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter,
  });
  return response.results;
};

export const _queryDatabasePage = async (pageId: string) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

const _getPageIcon = (page: PageObjectResponse) => {
  if (!page.icon) return undefined;
  if (page.icon.type === "emoji") {
    return { emoji: (page.icon as any).emoji };
  }
  if (page.icon.type === "external") {
    return {
      external: { url: (page.icon as any).external.url },
    };
  }
  if (page.icon.type === "custom_emoji") {
    return {
      custom_emoji: { ...(page.icon as any).custom_emoji },
    };
  }
  return undefined;
};

export async function findOrCreateRepo(): Promise<string> {
  const { repo } = config.github;

  const results = await _queryInDatabase(config.notion.reposDbId, {
    property: "Name",
    rich_text: {
      equals: repo,
    },
  });

  if (results.length > 0) {
    console.log(`⏩ Repo 「${repo}」 already exists in Notion.\n`);
    return results[0].id;
  }

  console.log(`➕ Repo 「${repo}」 not found, creating new entry...`);
  const repoInfo = await fetchRepo();
  const { html_url, created_at } = repoInfo;
  const { repoTempatePageId, reposDbId } = config.notion;

  const templatePage = (await _queryDatabasePage(
    repoTempatePageId
  )) as PageObjectResponse;
  console.log(`📝 Using repo template page: ${templatePage.id}`);

  const created = await notion.pages.create({
    parent: { database_id: reposDbId },
    properties: {
      Name: { title: [{ text: { content: repo } }] },
      URL: { url: html_url },
      "Start Date": { date: { start: created_at } },
      Stats: {
        relation: (
          templatePage.properties.Stats as { relation: { id: string }[] }
        ).relation.map((r: any) => ({
          id: r.id,
        })),
      },
    },
    icon: _getPageIcon(templatePage),
  });

  console.log(`✅ Created repo entry: ${created.id}\n`);
  return created.id;
}

export const getNotionDatabaseSchema = async (
  name: string,
  databaseId: string
) => {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  return response.properties;
};

export const createIssueInNotion = async (
  issue: GithubIssue,
  repoDbId: string,
  index: number
) => {
  const { rawIssuesDbId, rawIssueTemplatePageId } = config.notion;

  console.log(`🔎 ${index + 1} - Checking if issue 「${issue.title}」 exists in Notion...`);
  const existingIssues = await _queryInDatabase(rawIssuesDbId, {
    property: "URL",
    url: {
      equals: issue.html_url,
    },
  });

  if (existingIssues.length > 0) {
    console.log(`    ⏩ Issue 「${issue.title}」 already exists in Notion.`);
    return;
  }

  console.log(`    ➕ Issue 「${issue.title}」 not found, creating new entry...`);
  const templatePage = (await _queryDatabasePage(
    rawIssueTemplatePageId
  )) as PageObjectResponse;
  console.log(`    📝 Using issue template page: ${templatePage.id}`);

  await notion.pages.create({
    parent: { database_id: rawIssuesDbId },
    properties: {
      Name: { title: [{ text: { content: issue.title } }] },
      URL: { url: issue.html_url },
      Description: {
        rich_text: [{ text: { content: issue.body?.slice(0, 2000) || "" } }],
      },
      User: { select: { name: issue.user.login } },
      Repo: { relation: [{ id: repoDbId }] },
      IssueNumber: { type: "number", number: issue.number },
      "Created At": { date: { start: issue.created_at } },
      Status: {
        type: "status",
        status: {
          name: issue.state.charAt(0).toUpperCase() + issue.state.slice(1),
        },
      },
      Stats: {
        relation: (
          templatePage.properties.Stats as { relation: { id: string }[] }
        ).relation.map((r: any) => ({
          id: r.id,
        })),
      },
    },
    icon: _getPageIcon(templatePage),
  });
  console.log(`    ✅ Created issue entry: ${issue.title}`);
};
