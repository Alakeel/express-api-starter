const app = require('./app');
const { getVersion } = require('./version');

// Function to add color to console output
function colorize(text, colorCode) {
  return `\x1b[${colorCode}m${text}\x1b[0m`;
}

// Regular Colors:

// Black: 30
// Red: 31
// Green: 32
// Yellow: 33
// Blue: 34
// Magenta: 35
// Cyan: 36
// White: 37
// Bright/High-Intensity Colors:

// Bright Black: 90
// Bright Red: 91
// Bright Green: 92
// Bright Yellow: 93
// Bright Blue: 94
// Bright Magenta: 95
// Bright Cyan: 96
// Bright White: 97

// Get the version
const version = getVersion();
console.log(colorize(`Application version ${version}`, 36)); // 36 is the color code for cyan

const port = process.env.PORT || 5000;

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Running on: http://localhost:${port}`);
  /* eslint-enable no-console */
});
