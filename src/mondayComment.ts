import { marked } from "marked";
import { getName } from "./useInfo";

type PullRequest = {
  user: {
    login: string;
  };
  body: string;
  html_url: string;
};

export async function generateMondayComment(
  pullRequest: PullRequest
): Promise<string | null> {
  const userName = await getName(pullRequest.user.login);
  const mondayComment = pullRequest.body
    .split("Start Monday Comment")
    .pop()
    ?.split("End Monday Comment")[0]
    .trim();

  if (!mondayComment) {
    return null;
  }

  return `Comentário criado por: 
  <strong>${userName}</strong> a partir de um 
  <a href="${
    pullRequest.html_url
  }" target="_blank" rel="noopener noreferrer">Pull Request</a> 
  via API
  \n\n${marked(mondayComment)}`;
}
