import { executeCommand } from "../../helpers/executeCommand.js";
import { input } from "@inquirer/prompts";

/**
 * Runs the main function and prompts the user for their name.
 * Executes two commands and logs the results.
 * @param {Function} callback - The callback function to be called after execution.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
async function run(callback) {
  const answers = await input({
    message: "Enter your name:",
  });

  try {
    let command1 = `echo "Hello ${answers} on bash version"`;
    await executeCommand(command1);
    console.log(`Hello ${answers} on nodejs version`);

    let command2 = "ls -l";
    await executeCommand(command2);
    console.log("Command 2 executed successfully");
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  callback();
}

export { run };
