const path = require("path");
const fs = require("fs");

function checkContrastCoreLogic(
  hexTextColor,
  hexBackgroundColor,
  isLargeText,
  element,
  textColor,
  backgroundColor,
  contrastLevel = "AA"
) {
  // Convert hex colors to RGB and calculate luminance
  const textLuminance = getLuminance(hexToRgb(hexTextColor));
  const backgroundLuminance = getLuminance(hexToRgb(hexBackgroundColor));

  // Determine the contrast ratio
  const contrastRatio =
    (Math.max(textLuminance, backgroundLuminance) + 0.05) /
    (Math.min(textLuminance, backgroundLuminance) + 0.05);

  // Set the required contrast ratio based on level (AA or AAA)
  let requiredContrast;
  if (contrastLevel === "AAA") {
    requiredContrast = isLargeText ? 4.5 : 7.0; // AAA requires 4.5 for large and 7.0 for normal text
  } else if (contrastLevel === "AA") {
    requiredContrast = isLargeText ? 3.0 : 4.5; // AA requires 3.0 for large and 4.5 for normal text
  } else {
    throw new Error("Invalid contrast level provided. Use 'AA' or 'AAA'.");
  }

  // // Log the contrast ratio
  // // console.log(
  //   `Contrast ratio for ${hexTextColor} on ${hexBackgroundColor}: ${contrastRatio.toFixed(
  //     2
  //   )} (Required: ${requiredContrast})`
  // );

  // Check if the contrast meets the requirement based on the level
  if (contrastRatio < requiredContrast) {
    throw new Error(
      `=> ${element.selector} Contrast ratio ${contrastRatio.toFixed(
        2
      )} is below the required ${requiredContrast}:1 for ${
        isLargeText ? "large" : "normal"
      } text (Level ${contrastLevel}).  ${
        element.id
      } textColor: ${textColor} backgroundColor: ${backgroundColor}`
    );
  }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return [r, g, b];
}

// Helper function to calculate the relative luminance of an RGB color
function getLuminance([r, g, b]) {
  const [rNormalized, gNormalized, bNormalized] = [r, g, b].map((value) => {
    value /= 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rNormalized + 0.7152 * gNormalized + 0.0722 * bNormalized;
}

module.exports = checkContrastCoreLogic;
