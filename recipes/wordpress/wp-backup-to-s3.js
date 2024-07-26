import { executeCommand } from "../../helpers/executeCommand.js";
import { select, input } from "@inquirer/prompts";

/**
 * Runs the backup script for WordPress and uploads the backup to an S3 bucket.
 * @param {Function} callback - The callback function to be executed after the script completes.
 * @returns {Promise<void>} - A promise that resolves when the script completes.
 */
async function run(callback) {
  /* Create an inquirer prompt to ask the user for the aws region, then the bucket name, 
  then the wordpress directory and finally the wordpress installation name
  */
  const awsRegions = [
    { name: "us-east-1", value: "us-east-1" },
    { name: "us-west-1", value: "us-west-1" },
    { name: "us-west-2", value: "us-west-2" },
    { name: "eu-west-1", value: "eu-west-1" },
    { name: "eu-central-1", value: "eu-central-1" },
    { name: "ap-southeast-1", value: "ap-southeast-1" },
    { name: "ap-southeast-2", value: "ap-southeast-2" },
    { name: "ap-northeast-1", value: "ap-northeast-1" },
    { name: "ap-northeast-2", value: "ap-northeast-2" },
  ];
  const answers = {
    awsRegion: await select({
      message: "Select the AWS region:",
      choices: awsRegions,
    }),
    bucketName: await input({ message: "Enter the S3 bucket name:" }),
    wordpressDirectory: await input({
      message: "Enter the WordPress directory:",
    }),
    wordpressInstallationName: await input({
      message: "Enter the WordPress installation name:",
    }),
  };

  // Execute the script
  try {
    const wpPath = answers.wordpressDirectory;
    const wpName = answers.wordpressInstallationName;
    const awsRegion = answers.awsRegion;
    const bucketName = answers.bucketName;

    console.log("Selected Answers:");
    console.log("AWS Region:", awsRegion);
    console.log("Bucket Name:", bucketName);
    console.log("WordPress Directory:", wpPath);
    console.log("WordPress Installation Name:", wpName);

    // Check S3 connectivity and permissions
    console.log("Checking S3 connectivity and permissions...");
    await executeCommand(
      `aws s3 ls "s3://${bucketName}" >/dev/null 2>&1 || { echo -e "Error: Unable to access S3 bucket. Please check your connectivity and permissions."; exit 1; }`
    );
    console.log("S3 connectivity and permissions check passed.\n");

    // If WP_NAME is not provided, use the basename of WORDPRESS_PATH
    if (!wpName) {
      wpName = path.basename(wpPath);
    }

    // Create a timestamp for the backup
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");

    // Create a directory for the backup
    const backupDir = `/tmp/${wpName}-${timestamp}`;
    await executeCommand(`mkdir -p "${backupDir}"`);

    // Zip the WordPress files
    console.log(`Zipping the WordPress files for ${wpName}...`);
    await executeCommand(
      `tar -czf "${backupDir}/${wpName}-${timestamp}.tar.gz" -C "$(dirname "${wpPath}")" "$(basename "${wpPath}")"`
    );

    // Upload the backup to S3
    console.log(`Uploading the backup to S3 for ${wpName}...`);
    await executeCommand(
      `aws s3 cp "${backupDir}/${wpName}-${timestamp}.tar.gz" "s3://${bucketName}/" || { echo -e "Error: Failed to upload the backup to S3."; exit 1; }`
    );

    // Clean up the temporary backup directory
    console.log(`Cleaning up the temporary backup directory for ${wpName}...`);
    await executeCommand(`rm -rf "${backupDir}"`);

    console.log(`Backup completed for ${wpName}.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  callback();
}

export { run };
