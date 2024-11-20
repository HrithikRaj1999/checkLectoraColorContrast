const checkStaticCCwithCss = require("./checkStaticCCwithCss.js");
const storeCssFilePaths = require("./util/getAllCSSPaths");
const getAllCssStyleSheet = require("./util/getAllCssStyleSheet");
const storeHtmlFilePaths = require("./util/getAllHtmlPath");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const path = require("path");
const checkDynamicColorContrastCheck = require("./dynamicColorContrastCheck");
async function main() {
  storeHtmlFilePaths();
  storeCssFilePaths();
  const htmlFilesPathArray = JSON.parse(
    fs.readFileSync("./HTML_PATHS/htmlFiles.json", "utf8")
  );
  if (!htmlFilesPathArray || !htmlFilesPathArray.length) {
    return res.status(400).send("No Html pathsfound");
  }
  const browser = await puppeteer.launch({
    headless: "new",
  });
  // const browser = await puppeteer.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: "shell", });//for prod enable this an disable below
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  let totalInstChecked = 0;
  let totalInstFailed = 0;
  let data = [];
  let done = 0;
  for (const filePath of htmlFilesPathArray) {
    const styleSheetnameArray = getAllCssStyleSheet(filePath); //gives styleSheet Attached to this html
    const fileUrl = `file://${path.resolve(filePath)}`;
    console.log(
      "Testing is Running .......",
      Math.ceil((done / htmlFilesPathArray.length) * 100),
      "  %"
    );
    await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
    await page.goto(fileUrl, { waitUntil: "load" });
    await page.goto(fileUrl, { waitUntil: "networkidle0" });
    await page.goto(fileUrl, { waitUntil: "networkidle2" });
    await page.waitForSelector("body");
    const { xlsxArray, totalChecked, totalFailed } = await checkStaticCCwithCss(
      page,
      styleSheetnameArray
    );
    const {
      xlsxArray: xlsxArray2,
      totalChecked: totalChecked2,
      totalFailed: totalFailed2,
    } = await checkDynamicColorContrastCheck(page);
    totalInstChecked += totalChecked + totalChecked2;
    totalInstFailed += totalFailed + totalFailed2;
    data = [...data, ...xlsxArray, ...xlsxArray2];
    done += 1;
  }
  data = [
    {
      [`Total instances checked`]: totalInstChecked,
      [`Total instances Failed`]: totalInstFailed,
    },
    ...data,
  ];
  console.log("Testing is Running ..................", 100, " %");
  fs.writeFileSync(path.join(__dirname, "Output.json"), JSON.stringify(data));
  console.log(
    `Testing Completed Total instances checked: ${totalInstChecked},Total instances Failed: ${totalInstFailed}`
  );

  await browser.close();
}
main();
