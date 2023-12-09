import { executeCommand } from "../helpers/utils.js";

async function run() {
    try {
        // Step 1: Generate the database backup using WP-CLI
        await executeCommand('wp db export --add-drop-table');

        // Step 2: Compress the database backup and files into a tar.gz file
        await executeCommand('tar -czvf backup.tar.gz wp-content/ wp-config.php');

        // Step 3: Upload the backup file to S3 using AWS CLI
        await executeCommand('aws s3 cp backup.tar.gz s3://your-bucket-name/backup.tar.gz');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

export { run };