import { executeCommand } from "../helpers/utils.js";

/**
 * Sample function to execute a command asynchronously
 */
async function run() {
    try {
        let command1 = 'echo "Hello World"';
        await executeCommand(command1);
        console.log('Command 1 executed successfully');

        let command2 = 'ls -l';
        await executeCommand(command2);
        console.log('Command 2 executed successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

export { run };