/**
 * @module checkDynamicColorContrastCheck
 * @description This module checks the color contrast of text elements dynamically loaded on a webpage.
 * It evaluates if the text color and background color meet the WCAG accessibility standards.
 */

const checkContrast = require("./checkContrastCoreLogic.js");

/**
 * Main function to dynamically check color contrast of elements on a webpage.
 * @async
 * @function checkDynamicColorContrastCheck
 * @param {Object} page - The Puppeteer page instance representing the loaded webpage.
 * @returns {Promise<Object>} - A summary of the results:
 *  - `xlsxArray`: Array of failed elements with their tag and reason for failure.
 *  - `totalChecked`: Total number of elements checked.
 *  - `totalFailed`: Total number of elements that failed the contrast check.
 */
async function checkDynamicColorContrastCheck(page, logs2) {
  try {
    let data = []; // Array to store failed elements
    let totalChecked = 0; // Counter for total elements checked
    let totalFailed = 0; // Counter for total failures
    let logs2 = [];
    // Step 1: Fetch elements and their computed styles from the webpage
    const elements = await page.evaluate(() => {
      /**
       * Recursively calculates the effective background color of an element.
       * If the element's background is transparent, it checks its parent until a valid background is found.
       * @param {HTMLElement} element - The DOM element.
       * @returns {string} - The effective background color in RGB format.
       */
      function getEffectiveBackgroundColor(element) {
        if (!element) return "rgb(255, 255, 255)"; // Default to white if no background is found

        const backgroundColor =
          window.getComputedStyle(element).backgroundColor;

        // Return the background color if it's not transparent
        if (
          backgroundColor &&
          backgroundColor !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "transparent"
        ) {
          return backgroundColor;
        }
        // Check the parent element recursively
        return getEffectiveBackgroundColor(element.parentElement);
      }

      // Select all target elements and extract their details
      return Array.from(
        document.querySelectorAll(
          "div, span, p, header, footer, h1, h2, h3, h4, h5, h6, article, section, blockquote, pre, code, ul, ol, li, a, b, i, u, strong, em, small, mark, sub, sup, br, hr, form, input, textarea, button, select, option, optgroup, label, fieldset, legend, output, datalist, progress, meter, img, video, audio, source, track, picture, canvas, svg, iframe, table, caption, thead, tbody, tfoot, tr, td, th, col, colgroup, details, summary, dialog, nav, main, aside, figure, figcaption, time, address, cite, q, abbr, kbd, samp, var, data, ruby, rt, rp, wbr"
        )
      ).map((element) => ({
        text: element.textContent.trim(), // Text content inside the element
        html: element.outerHTML.trim(), // Outer HTML of the element
        selector: element.tagName.toLowerCase(), // Tag name (e.g., div, span)
        id: element.id || null, // ID of the element (if present)
        classList: [...element.classList], // List of classes applied to the element
        computedStyles: {
          textColor: window.getComputedStyle(element).color, // Text color
          backgroundColor: getEffectiveBackgroundColor(element), // Effective background color
          fontSize: window.getComputedStyle(element).fontSize, // Font size
          fontWeight: window.getComputedStyle(element).fontWeight, // Font weight
        },
      }));
    });

    // Step 2: Loop through each element and check color contrast
    for (const element of elements) {
      // Skip elements that have no text
      logs2.push(
        `Checking for Page:${(await page.title(), await page.url())}, Tag: ${
          element.selector
        } with ID: ${element.id || "No ID"}`
      );
      if (!element.text) continue;

      totalChecked += 1; // Increment the checked elements counter

      const { textColor, backgroundColor, fontSize, fontWeight } =
        element.computedStyles;

      // Skip elements with transparent or no background
      if (
        backgroundColor === "rgba(0, 0, 0, 0)" ||
        backgroundColor === "transparent"
      ) {
        continue;
      }

      // Ensure both text and background colors are available
      if (textColor && backgroundColor) {
        let hexTextColor = textColor;
        let hexBackgroundColor = backgroundColor;

        // Convert colors to HEX format if not already in HEX
        if (!isHexColor(textColor)) hexTextColor = rgbToHex(textColor);
        if (!isHexColor(backgroundColor))
          hexBackgroundColor = rgbToHex(backgroundColor);

        // Determine if the text qualifies as "large" based on WCAG rules
        const isLargeText = isTextLarge(fontSize, fontWeight);

        try {
          // Use the core logic to check color contrast
          checkContrast(
            hexTextColor,
            hexBackgroundColor,
            isLargeText,
            element,
            textColor,
            backgroundColor,
            "AA" // WCAG AA compliance level
          );
        } catch (error) {
          // If the element fails the contrast check, log the failure
          totalFailed += 1; // Increment failure counter
          const title = (await page.url()).split("/");
          logs2.push(
            `Error: Page:${title}, Tag ${element.selector} with ID: ${
              element.id || "No ID"
            }. Reason: ${error.message}`
          );
          data.push({
            Tag: element.html, // Store the element's outer HTML
            PageName: title.slice(title.length - 2, title.length).join("/"),
            Reason_For_Failing: error.message, // Store the failure reason
          });
        }
      }
    }

    // Prepare the data for exporting as a report
    let xlsxArray = data;

    // Return the results
    return { xlsxArray, totalChecked, totalFailed };
  } catch (error) {
    // Handle errors gracefully
    console.error("Error running accessibility test:", error);
    return { xlsxArray: [], totalChecked: 0, totalFailed: 0 };
  }
}

/**
 * Converts an RGB or RGBA color to Hexadecimal format.
 * @param {string} rgb - The RGB/RGBA color (e.g., "rgb(255, 255, 255)").
 * @returns {string|null} - The color in HEX format, or null if invalid.
 */
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g); // Extract numeric values from the color string
  if (!result) return null;

  const [r, g, b] = result; // Extract red, green, and blue components
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
 * Checks if the text is considered "large" based on WCAG guidelines.
 * Large text is defined as:
 * - Font size >= 18px (normal)
 * - Font size >= 14px (bold)
 * @param {string} fontSize - The font size of the text (e.g., "16px").
 * @param {string} fontWeight - The font weight of the text (e.g., "400").
 * @returns {boolean} - True if the text is large, false otherwise.
 */
function isTextLarge(fontSize, fontWeight) {
  const sizeInPx = parseFloat(fontSize); // Convert font size to a number
  const isBold = parseInt(fontWeight) >= 700; // Check if font weight is bold
  return sizeInPx >= 18 || (sizeInPx >= 14 && isBold);
}

/**
 * Validates if a given color is in Hexadecimal format.
 * @param {string} color - The color string to validate.
 * @returns {boolean} - True if the color is in HEX format, otherwise false.
 */
function isHexColor(color) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

module.exports = checkDynamicColorContrastCheck;
