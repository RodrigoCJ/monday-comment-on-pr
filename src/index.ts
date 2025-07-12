import * as core from "@actions/core";
import * as github from "@actions/github";
import { getName } from "./useInfo";

const apiKey = core.getInput("apiKey");
const payload = JSON.stringify(github.context.payload, undefined, 2);
const objPayload = JSON.parse(payload);
const pull_request = objPayload.pull_request;

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
    const content = `Comentário criado por: ${userName} a partir de um Pull-Request via API\n\n${mondayComment}\n\nMais informações no GitHub: ${pull_request.html_url}`;

    const query = `
      mutation CreateUpdate($itemId: Int!, $body: String!) {
        create_update(item_id: $itemId, body: $body) {
          id
        }
      }
    `;

    const variables = {
      item_id: activityId,
      body: content,
    };

    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query, variables }),
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
