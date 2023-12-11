const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Function to execute a command asynchronously
async function executeCommand(command) {
    try {
        const { stdout, stderr } = await exec(command);
        console.log(`Command output: ${stdout}`);
        if (stderr) {
            console.error(`Command execution failed: ${stderr}`);
        }
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
    }
}

module.exports = {
    executeCommand
};