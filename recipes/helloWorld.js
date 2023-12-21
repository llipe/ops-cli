/**
 * Runs the run function with a HelloWorld message.
 * @param {Function} callback - The callback function to be called after execution.
 * @returns {Promise<void>} - A promise that resolves when the execution is complete.
 */
async function run(callback) {
  try {
    console.log("Hello World!");
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  callback();
}

export { run };
