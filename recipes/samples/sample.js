import { executeCommand } from "../../helpers/executeCommand.js";
import inquirer from "inquirer";

/**
 * Runs the main function and prompts the user for their name.
 * Executes two commands and logs the results.
 * @param {Function} callback - The callback function to be called after execution.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
async function run(callback) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter your name:",
    },
  ]);

  try {
    let command1 = `echo "Hello ${answers.name} on bash version"`;
    await executeCommand(command1);
    console.log(`Hello ${answers.name} on nodejs version`);

    let command2 = "ls -l";
    await executeCommand(command2);
    console.log("Command 2 executed successfully");
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  callback();
}

export { run };
