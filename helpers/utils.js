import { promisify } from 'util';
import { exec } from 'child_process';

// Function to execute a command asynchronously
async function executeCommand(command) {
    try {
        const { stdout, stderr } = await promisify(exec)(command);
        console.log(`Command output: ${stdout}`);
        if (stderr) {
            console.error(`Command execution failed: ${stderr}`);
        }
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
    }
}

export { executeCommand };