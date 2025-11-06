const path = require("path");

module.exports = function override(config, env) {
  if (!config.resolve) config.resolve = {};
  if (!config.resolve.alias) config.resolve.alias = {};

  config.resolve.alias["@"] = path.resolve(__dirname, "src");

  return config;
};
