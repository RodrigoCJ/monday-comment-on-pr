import * as core from "@actions/core";
import * as github from "@actions/github";
import { getName } from "./useInfo";
import { marked } from "marked";

const apiKey = core.getInput("apiKey");
const payload = JSON.stringify(github.context.payload, undefined, 2);
const objPayload = JSON.parse(payload);
const pull_request = objPayload.pull_request;
const html_pr = marked(pull_request.html_url);

const mondayURl = pull_request.body
  .split("Link da tarefa no Monday:[")
  .pop()
  .split("](")
  .pop()
  .split(")")[0];

const match = mondayURl.match(/\/pulses\/(\d+)/);
const activityId = match ? match[1] : "";

const mondayComment = pull_request.body
  .split("Start Monday Comment")
  .pop()
  .split("End Monday Comment")[0]
  .trim();

async function run(): Promise<void> {
  try {
    const userName = await getName(pull_request.user.login);
    const content = `Comentário criado por: <strong>${userName}</strong> a partir de um <a href=\"${html_pr}\" target=\"_blank\" rel=\"noopener noreferrer noopener noreferrer\">Pull Request</a> via API\n\n${mondayComment}`;

    const mutation = `
      mutation($itemId: ID!, $body: String!) {
        create_update(item_id: $itemId, body: $body) {
          id
        }
      }
    `;

    const variables = {
      itemId: activityId,
      body: content,
    };

    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
