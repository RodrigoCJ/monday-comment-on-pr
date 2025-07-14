import * as core from "@actions/core";
import * as github from "@actions/github";
import { generateMondayComment } from "./mondayComment";

const apiKey = core.getInput("apiKey");
const payload = JSON.stringify(github.context.payload, undefined, 2);
const objPayload = JSON.parse(payload);
const pull_request = objPayload.pull_request;

async function run(): Promise<void> {
  try {
    if (!pull_request.body) {
      core.info("Sem body no pull-request");
      return;
    }

    const mondayURl = pull_request.body
      .split("Link da tarefa no Monday:[")
      .pop()
      .split("](")
      .pop()
      .split(")")[0];

    const match = mondayURl.match(/\/pulses\/(\d+)/);
    const activityId = match ? match[1] : "";

    if (!activityId) {
      core.info("Sem id da board do Monday para enviar");
      return;
    }

    const content = await generateMondayComment(pull_request);

    if (!content) {
      core.info("Sem comentário para enviar ao Monday");
      return;
    }

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
