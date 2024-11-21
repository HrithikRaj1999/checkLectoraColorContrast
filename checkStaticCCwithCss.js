/**
 * @module checkStaticCCwithCss
 * @description This module checks the color contrast of static elements on a webpage using external CSS files.
 * It parses and accumulates CSS rules, applies them to elements, and verifies if the color contrast meets WCAG standards.
 */

const fs = require("fs");
const path = require("path");
const css = require("css");
const checkContrast = require("./checkContrastCoreLogic");

// Path to the CSS folder
const cssFolderPath = path.join(__dirname, "./CSS_PATHS/cssFiles.json");

// Store all CSS rules in memory
let AllCssRule = {};

/**
 * Parses and accumulates CSS rules from the specified files into `AllCssRule`.
 * @param {string} cssFolderPath - Path to the JSON file containing paths to CSS files.
 * @param {Array<string>} styleSheetnameArray - Array of stylesheet names used in the HTML file.
 */
function parseAndAccumulateCSSFiles(cssFolderPath, styleSheetnameArray) {
  const cssFiles = JSON.parse(fs.readFileSync(cssFolderPath, "utf-8")).filter(
    (path) => {
      const temp = path.split("\\");
      const cssFileNameInFolder = temp[temp.length - 1];
      return styleSheetnameArray.includes(cssFileNameInFolder); // Only include CSS files used in the HTML
    }
  );

  cssFiles.forEach((singleCssFile) => {
    const cssPath = path.join(__dirname, singleCssFile);
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    try {
      const parsedCSS = css.parse(cssContent);

      parsedCSS.stylesheet.rules.forEach((rule) => {
        if (rule.type === "rule") {
          rule.selectors.forEach((selector) => {
            const className = selector.replace(/^\./, "");
            if (!AllCssRule[className]) {
              AllCssRule[className] = {};
            }

            rule.declarations.forEach((declaration) => {
              AllCssRule[className][declaration.property] = declaration.value;
            });
          });
        }
      });
    } catch (error) {
      // console.error(
      //   `Error parsing CSS file ${singleCssFile}: ${error.message}`
      // );
    }
  });
}

/**
 * Retrieves the styles for a specific set of classes from `AllCssRule`.
 * @param {Array<string>} classList - List of class names applied to an element.
 * @returns {Object} - An object containing styles like textColor, backgroundColor, fontSize, and fontWeight.
 */
function getStylesForClasses(classList) {
  const accumulatedStyles = {
    textColor: null,
    backgroundColor: null,
    fontSize: null,
    fontWeight: null,
  };

  classList.forEach((className) => {
    const styles = AllCssRule[className] || {};
    if (styles.color) accumulatedStyles.textColor = styles.color;
    if (styles["background-color"])
      accumulatedStyles.backgroundColor = styles["background-color"];
    if (styles["font-size"]) accumulatedStyles.fontSize = styles["font-size"];
    if (styles["font-weight"])
      accumulatedStyles.fontWeight = styles["font-weight"];
  });

  return accumulatedStyles;
}

/**
 * Main function to check color contrast for static elements using CSS files.
 * @async
 * @function checkStaticCCwithCss
 * @param {Object} page - The Puppeteer page instance.
 * @param {Array<string>} styleSheetnameArray - Array of stylesheet names used in the HTML file.
 * @returns {Promise<Object>} - A summary of the results:
 *  - `xlsxArray`: Array of elements that failed the contrast check.
 *  - `totalChecked`: Total number of elements checked.
 *  - `totalFailed`: Total number of failed elements.
 */
async function checkStaticCCwithCss(page, styleSheetnameArray, logs1) {
  try {
    let data = [];
    let totalChecked = 0;
    let totalFailed = 0;

    // Step 1: Parse CSS files and accumulate rules
    parseAndAccumulateCSSFiles(cssFolderPath, styleSheetnameArray);

    // Step 2: Fetch elements and their effective background colors
    const elements = await page.evaluate(() => {
      function getEffectiveBackgroundColor(element) {
        if (!element) return "rgb(255, 255, 255)";

        const backgroundColor =
          window.getComputedStyle(element).backgroundColor;

        if (
          backgroundColor &&
          backgroundColor !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "transparent"
        ) {
          return backgroundColor;
        }

        return getEffectiveBackgroundColor(element.parentElement);
      }

      return Array.from(
        document.querySelectorAll(
          "div, span, p, header, footer, h1, h2, h3, h4, h5, h6, article, section, blockquote, pre, code, ul, ol, li, a, b, i, u, strong, em, small, mark, sub, sup, br, hr, form, input, textarea, button, select, option, optgroup, label, fieldset, legend, output, datalist, progress, meter, img, video, audio, source, track, picture, canvas, svg, iframe, table, caption, thead, tbody, tfoot, tr, td, th, col, colgroup, details, summary, dialog, nav, main, aside, figure, figcaption, time, address, cite, q, abbr, kbd, samp, var, data, ruby, rt, rp, wbr"
        )
      ).map((element) => ({
        text: element.textContent.trim(),
        html: element.outerHTML.trim(),
        selector: element.tagName.toLowerCase(),
        id: element.id || null,
        classList: [...element.classList],
        effectiveBackgroundColor: getEffectiveBackgroundColor(element),
      }));
    });

    // Step 3: Evaluate each element's color contrast
    for (const element of elements) {
      if (!element.text) continue;
      totalChecked += 1;
      logs1.push(
        `Checking for Page:${(await page.title(), await page.url())}, Tag: ${
          element.selector
        } with ID: ${element.id || "No ID"}`
      );
      // console.log(
      //   `Checking Color Contrast with CSS files of Tag: ${
      //     element.selector
      //   } with ID: ${element.id || "No ID"}`
      // );

      let { textColor, backgroundColor, fontSize, fontWeight } =
        getStylesForClasses(element.classList);

      backgroundColor =
        backgroundColor ||
        element.effectiveBackgroundColor ||
        "rgb(255, 255, 255)";
      fontSize = fontSize || "16px";
      fontWeight = fontWeight || "400";

      if (textColor && backgroundColor) {
        let hexTextColor = textColor;
        let hexBackgroundColor = backgroundColor;

        if (!isHexColor(textColor)) hexTextColor = rgbToHex(textColor);
        if (!isHexColor(backgroundColor))
          hexBackgroundColor = rgbToHex(backgroundColor);

        const isLargeText = isTextLarge(fontSize, fontWeight);

        try {
          checkContrast(
            hexTextColor,
            hexBackgroundColor,
            isLargeText,
            element,
            textColor,
            backgroundColor,
            "AA"
          );
        } catch (error) {
          totalFailed += 1;
          const title = (await page.url()).split("/");
          logs1.push(
            `Error: Page:${title}, Tag ${element.selector} with ID: ${
              element.id || "No ID"
            }. Reason: ${error.message}`
          );
          data.push({
            Tag: element.html,
            PageName: title.slice(title.length - 2, title.length).join("/"),
            Reason_For_Failing: error.message,
          });
        }
      }
    }

    return { xlsxArray: data, totalChecked, totalFailed };
  } catch (error) {
    console.error("Error running accessibility test:", error);
    return { xlsxArray: [], totalChecked: 0, totalFailed: 0 };
  }
}

/**
 * Converts an RGB color to Hex format.
 * @param {string} rgb - The RGB color string.
 * @returns {string|null} - The Hex color string or null if invalid.
 */
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return null;

  const [r, g, b] = result;
  return `#${(
    (1 << 24) +
    (parseInt(r) << 16) +
    (parseInt(g) << 8) +
    parseInt(b)
  )
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

/**
 * Checks if text is considered "large" based on WCAG standards.
 * @param {string} fontSize - The font size (e.g., "16px").
 * @param {string} fontWeight - The font weight (e.g., "400").
 * @returns {boolean} - True if the text is large, otherwise false.
 */
function isTextLarge(fontSize, fontWeight) {
  const sizeInPx = parseFloat(fontSize);
  const isBold = parseInt(fontWeight) >= 700;
  return sizeInPx >= 18 || (sizeInPx >= 14 && isBold);
}

/**
 * Validates if a color is in Hex format.
 * @param {string} color - The color string.
 * @returns {boolean} - True if the color is in Hex format, otherwise false.
 */
function isHexColor(color) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

module.exports = checkStaticCCwithCss;
