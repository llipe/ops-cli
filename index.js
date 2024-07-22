import colors from "colors";
import dotenv from "dotenv";
import { showTopMenu } from "./helpers/inquirerMenu.js";

// Load the .env file
dotenv.config();

// Call the showMenu function to display the menu
showTopMenu();
