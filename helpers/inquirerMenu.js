import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';

// Function to get the list of recipe modules in the recipes folder
async function getRecipeModules() {
    const recipeFolder = './recipes';
    const recipeFiles = await fs.readdir(recipeFolder);
    const recipeModules = [];

    for (const file of recipeFiles) {
        const module = await import(`../recipes/${file}`);
        const moduleName = module.default && module.default.name ? module.default.name : path.parse(file).name;
        recipeModules.push({ module, name: moduleName });
    }

    return recipeModules;
}

// Function to display the Inquirer menu
async function showMenu() {
    const recipeModules = await getRecipeModules();

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'recipe',
                message: 'Select a recipe to run:',
                choices: recipeModules.map((module) => module.name),
            },
        ])
        .then((answers) => {
            // Handle the selected recipe
            const selectedRecipe = answers.recipe;
            console.log(`Running recipe: ${selectedRecipe}`);
            // Call the function to run the selected recipe
            const selectedModule = recipeModules.find((module) => module.name === selectedRecipe);
            selectedModule.module.run();
        })
        .catch((error) => {
            console.error(error);
        });
}

// Export the showMenu function
export { showMenu };