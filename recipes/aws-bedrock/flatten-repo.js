import fs from "fs";
import path from "path";
import ignore from "ignore";
import { input } from '@inquirer/prompts';

/**
 * Runs the flatten-repo script.
 *
 * @param {Function} callback - The callback function to be called after the script finishes running.
 * @returns {Promise<void>} - A promise that resolves when the script finishes running.
 */
async function run(callback) {
  try {
    // Function to read .gitignore and return an ignore object
    const readGitignore = (repoPath) => {
      const gitignorePath = path.join(repoPath, ".gitignore");
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
        let ignored = ignore().add(gitignoreContent);

        ignored = ignored.add(".*"); // Ignore all hidden files
        ignored = ignored.add("*test*"); // Ignore all files with "test" in the name
        ignored = ignored.add("package-lock.json"); // Ignore package-lock.json

        return ignored;
      }
      return ignore();
    };

    // Recursive function to list all files in directory excluding .git and node_modules
    const listFiles = (dir, ig, fileList = []) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (ig.ignores(filePath.replace(repoPath + "/", ""))) return;
        if (fs.statSync(filePath).isDirectory()) {
          if (file !== ".git" && file !== "node_modules") {
            listFiles(filePath, ig, fileList);
          }
        } else {
          fileList.push(filePath);
        }
      });
      return fileList;
    };

    // Function to merge files into a single file
    const mergeFiles = (repoPath, outputFile) => {
      const ig = readGitignore(repoPath);
      const files = listFiles(repoPath, ig);
      const allowedExtensions = [".js", ".jsx", ".ts", ".tsx", ".json", ".md"];

      let mergedContent = "";
      files.forEach((file) => {
        if (allowedExtensions.includes(path.extname(file))) {
          const content = fs.readFileSync(file, "utf8");
          mergedContent += `// ****** Source: ${file.replace(
            repoPath + "/",
            ""
          )} ******\n${content}\n\n`;
        }
      });

      fs.writeFileSync(outputFile, mergedContent);
      console.log(`Files merged into ${outputFile}`);
    };

    // Prompt the user for the repo path
    const answers = await input({
      message: "Full path to the repo (e.g:/path/to/your/repo):",
    });

    const repoPath = answers;
    const outputFile = "./output-file.txt";

    mergeFiles(repoPath, outputFile);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  callback();
}

export { run };
