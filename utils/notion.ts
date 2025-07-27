import { Client, PageObjectResponse } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
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

export async function checkIfIssueExists(issueUrl: string): Promise<boolean> {
  const { rawIssuesDbId } = config.notion;

  const response = await notion.databases.query({
    database_id: rawIssuesDbId,
    filter: {
      property: "URL",
      url: {
        equals: issueUrl,
      },
    },
  });

  return response.results.length > 0;
}

export const findOrCreateRepo = async (
  repoName: string,
  repoOwner: string
): Promise<string> => {
  const results = await _queryInDatabase(config.notion.reposDbId, {
    property: "Name",
    rich_text: {
      equals: repoName,
    },
  });

  if (results.length > 0) {
    console.log(`⏩ Repo 「${repoName}」 already exists in Notion.\n`);
    return results[0].id;
  }

  console.log(`➕ Repo 「${repoName}」 not found, creating new entry...`);
  const repoInfo = await fetchRepo(repoName, repoOwner);
  const { html_url, created_at } = repoInfo;
  const { repoTempatePageId, reposDbId } = config.notion;

  const templatePage = (await _queryDatabasePage(
    repoTempatePageId
  )) as PageObjectResponse;
  console.log(`📝 Using repo template page: ${templatePage.id}`);

  const created = await notion.pages.create({
    parent: { database_id: reposDbId },
    properties: {
      Name: { title: [{ text: { content: repoName } }] },
      URL: { url: html_url },
      "Start Date": { date: { start: created_at } },
      Stats: {
        relation: (
          templatePage.properties.Stats as { relation: { id: string }[] }
        ).relation.map((r: any) => ({
          id: r.id,
        })),
      },
      Status: {
        type: "status",
        status: {
          name: "In Progress",
        },
      },
    },
    icon: _getPageIcon(templatePage),
  });

  console.log(`✅ Created repo entry: ${created.id}\n`);
  return created.id;
};

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

  console.log(
    `🔎 ${index + 1} - Checking if issue 「${issue.title}」 exists in Notion...`
  );
  const isIssueExists = await checkIfIssueExists(issue.html_url);
  if (isIssueExists) {
    console.log(`    ⏩ Issue 「${issue.title}」 already exists in Notion.`);
    return;
  }

  console.log(
    `    ➕ Issue 「${issue.title}」 not found, creating new entry...`
  );
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

const USERS_DB_ID = process.env.NOTION_USERS_DB_ID!;

// export async function getOrCreateUser(
//   githubLogin: string,
//   profileUrl: string
// ): Promise<string> {
//   const searchRes: QueryDatabaseResponse = await notion.databases.query({
//     database_id: USERS_DB_ID,
//     filter: {
//       property: "URL",
//       url: {
//         equals: profileUrl,
//       },
//     },
//   });

//   if (searchRes.results.length > 0) {
//     return searchRes.results[0].id;
//   }

//   const userPage = await notion.pages.create({
//     parent: { database_id: USERS_DB_ID },
//     properties: {
//       Name: {
//         title: [{ text: { content: githubLogin } }],
//       },
//       URL: {
//         url: profileUrl,
//       },
//     },
//   });

//   return userPage.id;
// }

// async function setSelfReference(pageId: string) {
//   await notion.pages.update({
//     page_id: pageId,
//     properties: {
//       "Self Reference": {
//         relation: [{ id: pageId }],
//       },
//     },
//   });
// }
