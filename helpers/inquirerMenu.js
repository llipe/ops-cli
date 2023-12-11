import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";

// Function to get the list of recipe modules in the recipes folder
async function getRecipeModules() {
  const recipeFolder = "./recipes";
  const recipeFiles = await fs.readdir(recipeFolder);
  const recipeModules = [];

  for (const file of recipeFiles) {
    const module = await import(`../recipes/${file}`);
    const moduleName =
      module.default && module.default.name
        ? module.default.name
        : path.parse(file).name;
    recipeModules.push({ module, name: moduleName });
  }

  return recipeModules;
}

function printHeader() {
  console.clear();
  console.log("====================================".white);
  console.log("  OPS-CLI: Select an option".green);
  console.log("====================================".white);
}

// Function to display the TopMenu
async function showTopMenu() {
  printHeader();
  inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "Select an option:",
        choices: ["Execute Recipes", "Exit"],
      },
    ])
    .then((answers) => {
      // Handle the selected option
      const selectedOption = answers.option;
      if (selectedOption === "Execute Recipes") {
        // Call the function to show the recipe menu
        showRecipeMenu();
      } else if (selectedOption === "Exit") {
        console.log("Exiting the app...Bye!");
        // Add any necessary cleanup or exit logic here
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// Function to display the recipe menu
async function showRecipeMenu() {
  printHeader();
  const recipeModules = await getRecipeModules();

  inquirer
    .prompt([
      {
        type: "list",
        name: "recipe",
        message: "Select a recipe to run:",
        choices: [
          ...recipeModules.map((module) => module.name),
          "Return to TopMenu",
        ],
      },
    ])
    .then((answers) => {
      // Handle the selected recipe
      const selectedRecipe = answers.recipe;
      if (selectedRecipe === "Return to TopMenu") {
        // Call the function to show the TopMenu
        showTopMenu();
      } else {
        console.log(`Running recipe: ${selectedRecipe}`);
        // Call the function to run the selected recipe
        const selectedModule = recipeModules.find(
          (module) => module.name === selectedRecipe
        );
        selectedModule.module.run();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// Export the showTopMenu function
export { showTopMenu };
