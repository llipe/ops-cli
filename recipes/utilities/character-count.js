import fs from "fs/promises";
import { input } from "@inquirer/prompts";

async function run(callback) {
  try {
    // Use inquirer to get the file path input
    const answers = await input({
      message: "Full path to file (e.g.:/usr/file/awesome.txt):",
    });

    // Read the file from the given path
    const data = await fs.readFile(answers, "utf8");

    // Count the characters in the file
    const characterCount = data.length;

    // Print the character count to the console
    console.log(`The file has ${characterCount} characters.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  callback();
}

export { run };
