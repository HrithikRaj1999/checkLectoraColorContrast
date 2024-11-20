const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

const sourceDir = "./lectora_Package"; // Replace with your source folder
const outputJsonPath = "./CSS_PATHS/cssFiles.json"; // Path to store the JSON file
const cssOutDir = "./CSS_PATHS";
/**
 * Recursively fetch all CSS files from a given directory.
 * @param {string} dir - Directory to search.
 * @returns {string[]} - Array of CSS file paths.
 */
const getAllCssFiles = (dir) => {
  let cssFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      cssFiles = [...cssFiles, ...getAllCssFiles(filePath)];
    } else if (_.endsWith(filePath, ".css")) {
      cssFiles.push(filePath);
    }
  });

  return cssFiles;
};

/**
 * Store all CSS file paths in a JSON file.
 */
const storeCssFilePaths = async () => {
  try {
    // Get all CSS files
    const cssFiles = getAllCssFiles(sourceDir);
    await fs.ensureDir(cssOutDir);
    // Write file paths to JSON
    await fs.writeJson(outputJsonPath, cssFiles, { spaces: 2 });

    console.log(`CSS file paths have been saved to ${outputJsonPath}`);
  } catch (error) {
    console.error("Error saving CSS file paths:", error);
  }
};

// Run the script

module.exports = storeCssFilePaths;
