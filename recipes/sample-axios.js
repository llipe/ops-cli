import axios from "axios";
import inquirer from "inquirer";



/**
 * Runs the function with an optional callback.
 * Makes an API call to the useless facts API if confirmed by the user.
 * Logs the response data or any error that occurs.
 * Calls the callback function after completion.
 *
 * @param {Function} callback - The optional callback function to be called after completion.
 * @returns {Promise<void>} - A promise that resolves after the function completes.
 */
async function run(callback) {
  const url = "https://uselessfacts.jsph.pl/api/v2/facts/random";
  // inquirer promt to confirm api call
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Call the useless facts API?",
    },
  ]);
  
  // if user does not confirm, call the callback function and return
  if (!answers.confirm) {
    callback();
    return;
  }

  // make the api call and log the response data or any error that occurs
  try {
    const response = await axios.get(url);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
  callback();
}

export { run };
