'use strict';
// Common setup functions for unit tests.

const _ = require('lodash');
const config = require('../../src/config');

const settings = {
  CONTROL_REPO_PATH: './test/test-control',
  CONTENT_SERVICE_URL: 'http://content',
  PRESENTED_URL_PROTO: 'https',
  PRESENTED_URL_DOMAIN: 'deconst.horse',
  PRESENTER_API_PATH: '_api',
  PRESENTER_LOG_LEVEL: process.env.PRESENTER_LOG_LEVEL || 'error',
  PRESENTER_LOG_COLOR: process.env.PRESENTER_LOG_COLOR
};

exports.settings = settings;

exports.reconfigure = function () {
  config.configure(settings);
};

exports.reconfigureWith = function (overrides) {
  return () => {
    let s = _.defaults(overrides, settings);
    config.configure(s);
  };
};
