const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

const sourceDir = "./lectora_Package"; // Replace with your source folder
const outputJsonPath = "./HTML_PATHS/htmlFiles.json"; // Path to store the JSON file
const htmlOutputDir = "./HTML_PATHS";

/**
 * Recursively fetch all HTML files from a given directory.
 * @param {string} dir - Directory to search.
 * @returns {string[]} - Array of HTML file paths.
 */
const getAllHtmlFiles = (dir) => {
  let htmlFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      htmlFiles = [...htmlFiles, ...getAllHtmlFiles(filePath)];
    } else if (_.endsWith(filePath, ".html")) {
      htmlFiles.push(filePath);
    }
  });

  return htmlFiles;
};

/**
 * Store all HTML file paths in a JSON file.
 */
const storeHtmlFilePaths = async () => {
  try {
    // Get all HTML files
    const htmlFiles = getAllHtmlFiles(sourceDir);

    // Ensure output directory exists
    await fs.ensureDir(htmlOutputDir);
    // Write file paths to JSON
    await fs.writeJson(outputJsonPath, htmlFiles, { spaces: 2 });

    console.log(`HTML file paths have been saved to ${outputJsonPath}`);
  } catch (error) {
    console.error("Error saving HTML file paths:", error);
  }
};
module.exports = storeHtmlFilePaths;
