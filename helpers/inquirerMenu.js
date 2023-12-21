import fs from "fs/promises";
import path from "path";
import dirname from "path";
import fileURLToPath from "url";
import inquirer from "inquirer";
import appPackage from '../package.json' with { "type": "json" };

/**
 * Gets the list of recipe modules in the recipes folder.
 * @param {string} recipeFolderParam - The path to the recipe folder.
 * @returns {Promise<Array>} A promise that resolves with the list of recipe modules. Each item is an object with the module, name and type properties. If the recipe type is a directory, the module property is null.
 */
async function getRecipeModules(recipeFolderParam = "./recipes") {
  const recipeFolder = recipeFolderParam.replace(/\/$/, ""); // Removes trailing slash
  console.log(`Showing recipes from: ${recipeFolder}`);
  const recipeFiles = await fs.readdir(recipeFolder);
  const recipeModules = [];

  for (const file of recipeFiles) {
    const filePath = path.join(recipeFolder, file);
    const fileStats = await fs.stat(filePath);
    if (fileStats.isDirectory()) {
      const directoryName = path.parse(file).name;
      recipeModules.push({
        module: null,
        name: directoryName,
        type: "directory",
      });
    } else {
      const module = await import(`../${recipeFolder}/${file}`);
      const moduleName =
        module.default && module.default.name
          ? module.default.name
          : path.parse(file).name;
      recipeModules.push({ module, name: moduleName, type: "recipe" });
    }
  }

  return recipeModules;
}

/**
 * Prints the header of the menu.
 */
function printHeader() {
  console.clear();
  console.log("====================================".white);
  console.log("  OPS-CLI: Select an option".green);
  console.log("====================================".white);
  console.log(
    "Ops-cli is a tool to facilitate streamlined and extensible operational scripting for teams.\nThis CLI tool offers a foundation for executing simple operational scripts.\n".gray
  );
}

/**
 * Displays the top menu and handles the selected option.
 */
async function showTopMenu() {
  printHeader();
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: "Select an option:",
      choices: ["Execute Recipes", "About", "Exit"],
    },
  ]);

  const selectedOption = answers.option;
  if (selectedOption === "Execute Recipes") {
    showRecipeMenu();
  } else if (selectedOption === "About") {
    showAboutMenu();
    // Add any necessary cleanup or exit logic here
  } else if (selectedOption === "Exit") {
    console.log("Exiting the app...Bye!");
    // Add any necessary cleanup or exit logic here
  }
}

/**
 * Displays a menu to select a recipe and executes the selected recipe.
 * @param {string} recipeSubPath - The subpath of the recipe folder.
 * @returns {Promise<void>} A promise that resolves when the menu is displayed and the selected recipe is executed.
 */
async function showRecipeMenu(recipeSubPath = null) {
  printHeader();
  let recipePath =
    recipeSubPath == null ? "./recipes" : "./recipes/" + recipeSubPath;
  const recipeModules = await getRecipeModules(recipePath);

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "recipe",
      message: "Select a recipe to run:",
      choices: [
        ...recipeModules.map((module) => module.name),
        "Return to TopMenu",
      ],
    },
  ]);

  const selectedRecipe = answers.recipe;
  if (selectedRecipe === "Return to TopMenu") {
    showTopMenu();
  } else {
    const selectedModule = recipeModules.find(
      (module) => module.name === selectedRecipe
    );
    if (selectedModule.type === "directory") {
      showRecipeMenu(selectedRecipe);
      return;
    }
    console.log(`Running recipe: ${selectedRecipe}`);
    const recipeInstance = selectedModule.module;
    recipeInstance.run(returnToTopMenu);
  }
}
/**
 * Displays the about menu.
 */
async function showAboutMenu() {
  printHeader();

  console.log(`${appPackage.description}\n`);
  console.log(`Version: ${appPackage.version}\n`);

  console.log(`Author: ${appPackage.author}`);
  console.log(`URL: ${appPackage.homepage}`);
  console.log(`License: ${appPackage.license}`);

  returnToTopMenu();
}

/**
 * Asks the user whether they want to return to the top menu or end the program.
 */
async function returnToTopMenu() {
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "returnToTopMenu",
      message: "Return to the Menu?",
    },
  ]);

  if (answers.returnToTopMenu) {
    showTopMenu();
  } else {
    console.log("Exiting the app...Bye!");
    // Add any necessary cleanup or exit logic here
  }
}

export { showTopMenu };
