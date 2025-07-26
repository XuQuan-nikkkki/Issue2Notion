export const transformIssueToNotion = (issue: any, dbProps: any) => {
  const properties: any = {};

  if (dbProps["Name"]) {
    properties["Name"] = {
      title: [{ text: { content: issue.title } }],
    };
  }

  if (dbProps["URL"]) {
    properties["URL"] = {
      url: issue.html_url,
    };
  }

  if (dbProps["Description"]) {
    properties["Description"] = {
      rich_text: [{ text: { content: issue.body?.slice(0, 2000) || "" } }],
    };
  }

  if (dbProps["User"]) {
    properties["User"] = {
      select: { name: issue.user.login },
    };
  }

  if (dbProps["Created At"]) {
    properties["Created At"] = {
      date: { start: issue.created_at },
    };
  }

  if (dbProps["Status"]) {
    properties["Status"] = {
      select: { name: issue.state === "open" ? "Open" : "Closed" },
    };
  }

  if (dbProps["labels"]) {
    properties["labels"] = {
      multi_select: issue.labels.map((label: any) => ({ name: label.name })),
    };
  }

  return properties;
};
