/**
 * Runs a dummy JSON API call using axios and inquirer.
 * 
 * @param {function} callback - The callback function to be called after the API call.
 * @returns {Promise<void>} - A promise that resolves when the API call is completed.
 */
import axios from 'axios';
import inquirer from 'inquirer';


async function run(callback) {

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Dummy JSON API call?',
        },
    ]);

    // If the user does not confirm, call the callback function and return
    if (!answers.confirm) {
        callback();
        return;
    }

    try {
        const response = await axios.get('https://dummyjson.com/products/1');
        console.log(response.data);
        callback(null, response.data);
    } catch (error) {
        callback(error);
    }
}

export { run };