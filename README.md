# Issue2Notion

Issue2Notion is a small utility designed to help you bring repo issues into your Notion workspace — automatically and effortlessly.

It’s built to work hand in hand with my Notion templates:

- 🟢 [**Raw Issue Tracker (Lite)**](https://nikkkkidev.gumroad.com/l/raw_issue_tracker) – a lightweight issue tracker for quick setup
- 🟣 **Dev Sprint OS (Pro)** – a full-featured system for managing development sprints and progress _(coming soon — stay tuned!)_

<details>
  <summary>🧾 About the templates</summary>
  <br/>

**🟢 Raw Issue Tracker (Lite)**

- ⚠️ Jumping between GitHub/GitLab just to track issues?
- ✅ Instantly centralize them in Notion, across repos and platforms.
- 🔄 Basic properties included: title, description, status, labels, repo.
- 🧩 Use as step 1 of the Dev Sprint OS workflow.

---

**🟣 Dev Sprint OS (Pro)**

- 🧲 Collect & filter issues from any repo.
- 🧠 Prioritize with impact-effort scores.
- 📌 Kanban board for clear sprint progress.
- 🕒 Track input vs outcome.
- 🔁 Built-in retrospectives for continuous learning.
- 🧑‍💻 Perfect for solo devs or small remote teams.

</details>

## ✨ What Issue2Notion does

Bring your issues into Notion — clearly and effortlessly.
It currently supports:

- 🧩 **One-time import** – sync existing issues from your code repositories into a Notion database
- 🔔 **Auto-sync via webhook** – keep Notion updated when new issues are created

More features are coming. For now, if you’re building your workflows in Notion and want your issues to follow — you’re in the right place.

## 1. 📥 Import existing issues (one-time setup)

This script will:

- 🧭 Create any missing repos in your Repos database
- 📦 Import all issues (open or closed) from each repo into the Raw Issues Database
- 🧵 Sync each issue’s current state (Dopen / closed) and other properties

You only need to run this script once — unless you don’t plan to set up webhooks and want to fetch newly created issues later.

### Step 1. Clone the repo

```bash
git clone https://github.com/XuQuan-nikkkki/Issue2Notion.git
cd Issue2Notion
```

### Step 2: Create a `.env` file

```bash
cp .env.example .env
```

### Step 3: Get the required tokens

Here are the variables you’ll need to set:

```makefile
# Github
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name

# Notion
NOTION_TOKEN=your_notion_token_here
NOTION_REPOS_DB_ID=your_repos_database_id
NOTION_RAW_ISSUES_DB_ID=your_raw_issues_database_id
NOTION_STATS_DB_ID=your_stats_database_id
NOTION_REPO_TEMPLATE_PAGE_ID=your_repo_template_page_id
```

Let’s walk through how to get each of them 👇

#### `GITHUB_TOKEN`

- Create a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with repo scope.

#### `NOTION_TOKEN`

- In Notion, create a connection (via [My Integrations](https://www.notion.so/profile/integrations)).

  <img src="https://p.ipic.vip/30geih.png" alt="image-20250727144545943"  />

- Copy the internal integration token.

  ![image-20250727144856724](https://p.ipic.vip/a3qtxg.png)

- Then, share access with all three databases in your template — otherwise the integration won’t have permission to read/write.

  ![image-20250727144950299](https://p.ipic.vip/tdvgdl.png)

#### `NOTION_REPOS_DB_ID` and `NOTION_RAW_ISSUES_DB_ID`

- Open each database in your browser, then copy the ID from the address bar. The ID is the long string **after the last `/` and before the `?`**, usually 32 characters.

  ![image-20250727145937755](https://p.ipic.vip/gqdl4u.png)

#### `NOTION_REPO_TEMPLATE_PAGE_ID` and `NOTION_RAW_ISSUE_TEMPLATE_PAGE_ID`

- Go to the database `DB-Repos` and `DB-Raw Issues`.
- Click the small arrow next to the **New** button (▾).

  ![image-20250727150405909](https://p.ipic.vip/kjcwx7.png)

- Choose **Edit ** template.

  ![image-20250727150515316](https://p.ipic.vip/oy2ysk.png)

- Then click the **Open in full page** button in the top right corner.

  ![image-20250727150558363](https://p.ipic.vip/8tohtb.png)

- Copy the ID from the address bar. The ID is the long string \*\*after the last `/.

  ![image-20250727150931808](https://p.ipic.vip/l3nuc9.png)

### Step 4: Install dependencies

```bash
npm install
```

### Step 5: Run the import

```bash
npm run import
```
You’ll see progress logs in the terminal as the script runs, so you know what’s being imported.

![image-20250727155606395](https://p.ipic.vip/cpzxdl.png)

### 🛠 Troubleshooting

- Getting an ETIMEOUT error?

  Try running the script again — the Notion API can sometimes be flaky with larger batches.

## 2. 🪝 Set up webhook for automatic syncing

This step will:

- 🔔 Listen for new issue events in your connected repositories
- 🪄 Instantly create a corresponding entry in your Notion database — no need to run the import script again
- 🧼 Keep your issue tracker tidy and up-to-date with minimal manual effort

You only need to set this up once per repository.

### 1. 🌀 Fork the repo

Click the Fork button at the top-right of this GitHub repository.

### 2. 🚀 Deploy the webhook (using Vercel)

You can deploy the webhook in any way you like (e.g. Railway, Render, self-hosting), but here’s a quick start using Vercel:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repo you just forked
3. When prompted to select a framework, choose **Next.js**.
4. Upload the `.env` file
    
    To simplify setup, this project includes a pre-configured `.env` file.  
    Just upload your local `.env` file (with all credentials filled in) to Vercel's Environment Variables section during deployment.
    > 📝 Make sure your `.env` includes all required values: GitHub token, Notion token, database IDs, and template page IDs.  
    > Do **not** commit the `.env` file to a public repo unless you've removed sensitive content.

5. Click Deploy

   Once deployed, your webhook will be available at: https://your-vercel-app.vercel.app/api/webhook
   Copy this URL — you’ll need it in the next step.

### 3. 🔗 Add the webhook to your GitHub repos

For each repo you want to track:

- Go to the repo → Settings → Webhooks
- Click Add webhook
- Paste your webhook URL into Payload URL
- Set Content type to `application/json`
- Leave `Secret` blank
- Select `Let me select individual events`
- Check only Issues and uncheck everything else
- Click Add webhook

### 4. ✅ Test the webhook
Now let’s make sure everything works!
- Go to one of your GitHub repos
- Open an issue (or edit an existing one)
- You should see the new issue show up in Notion within a few seconds

If nothing happens, check:
- The webhook logs in GitHub → Settings → Webhooks
- Your Vercel deployment logs
