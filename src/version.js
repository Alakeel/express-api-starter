const packageJson = require('../package.json');

function getVersion() {
  return packageJson.version;
}

module.exports = { getVersion };
