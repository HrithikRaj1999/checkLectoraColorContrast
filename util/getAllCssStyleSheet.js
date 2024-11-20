const cheerio = require("cheerio");
const fs = require("fs");

const getAllCssStyleSheet = (htmlPath) => {
  // Read the HTML file (you can replace this with the HTML string if needed)
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Load the HTML into Cheerio
  const $ = cheerio.load(html);

  // Find all <link> tags with rel="stylesheet" and get the 'href' attribute
  const cssFiles = [];
  $('link[rel="stylesheet"]').each((index, element) => {
    const href = $(element).attr("href");
    const splittedStr = href.split("/");
    cssFiles.push(splittedStr[splittedStr.length - 1]);
  });

  return cssFiles;
};
module.exports = getAllCssStyleSheet;
