const path = require('path');

module.exports = function override(config, env) {
  config.output.filename = 'static/js/[name].js';
  config.output.chunkFilename = 'static/js/[name].js';
  config.plugins[5].options.filename = 'static/css/[name].css';
  config.plugins[5].options.chunkFilename = 'static/css/[name].css';

  return config;
};