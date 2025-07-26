export type Repos = {

}

export type GithubIssue = {
  id: number;
  title: string;
  html_url: string;
  number: number;
  body?: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  state: "open" | "closed";
  labels: Array<{
    name: string;
  }>;
}