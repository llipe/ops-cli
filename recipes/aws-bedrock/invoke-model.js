import inquirer from "inquirer";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID =
  process.env.MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

export const invokeModel = async (prompt, modelId = MODEL_ID) => {
  // Create a new Bedrock Runtime client instance.
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
  });

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    temperature: 0.5,
    top_k: 250,
    top_p: 1,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  };

  // Invoke the model with the payload and wait for the response.
  const command = new InvokeModelCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });
  const apiResponse = await client.send(command);

  // Decode and return the response(s).
  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  /** @type {ResponseBody} */
  const responseBody = JSON.parse(decodedResponseBody);
  //console.log(responseBody);
  return responseBody.content[0];
};

async function run(callback) {
  // Ask for the prompt input using inquirer
  const userInputPrompt = await inquirer.prompt([
    {
      type: "input",
      name: "prompt",
      message: "Enter a prompt:",
    },
  ]);

  // inquirer promt to confirm api call
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Call the bedrock API?",
    },
  ]);

  // if user does not confirm, call the callback function and return
  if (!answers.confirm) {
    callback();
    return;
  }

  // make the api call and log the response data or any error that occurs
  try {
    console.log("-".repeat(53));
    console.log("Calling Bedrock API");
    console.log("Model ID: " + MODEL_ID);
    console.log("Prompt: " + userInputPrompt.prompt);
    console.log("-".repeat(53));

    const response = await invokeModel(userInputPrompt.prompt, MODEL_ID);
    console.log(response.text);
  } catch (error) {
    console.error(error);
  }
  callback();
}

export { run };
