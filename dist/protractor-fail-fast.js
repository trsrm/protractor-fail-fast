'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _path = require('path');

var _jasmineFailFast = require('jasmine-fail-fast');

/**
 * protractor-fail-fast
 *
 * Since test runners run in independent processes, we use a "fail file", `.protractor-fail-fast`,
 * to communicate between them (better ideas welcome). The "fail file" is created when
 * the plugin is initialized and the test runners then continuously check for the presence
 * of it. If/when a test runner fails, it will delete the "fail file", signaling to the
 * other test runners to stop the test run.
 */
var failFile = (0, _path.resolve)(process.cwd(), './.protractor-fail-fast');

exports.default = {
  init: function init() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { abortAllShards: true };

    if (options && options.abortAllShards === false) {
      failFile += '-' + process.pid;
    }

    // Create the fail file at the beginning of the test run. This cannot take place inside
    // the plugin hooks since each test runner creates its own instance of the plugin,
    // causing race conditions. `init` is assumed to be run inside the Protractor config file,
    // thereby executing only once and prior to the test runners being created.
    createFailFile();

    // Returns the plugin in the "inline" format:
    // http://www.protractortest.org/#/plugins#using-plugins
    // Only way to force the user to call `init` to use the plugin.
    return {
      inline: {
        onPrepare: function onPrepare() {
          (0, _jasmineFailFast.init)();
        },

        postTest: function postTest(passed) {
          if (!passed) {
            deleteFailFile();
          }

          if (hasFailed()) {
            (0, _jasmineFailFast.disableSpecs)();
          }
        }
      }
    };
  },

  clean: function clean() {
    deleteFailFile();
  }
};


function hasFailed() {
  return !(0, _fs.existsSync)(failFile);
}

function createFailFile() {
  (0, _fs.closeSync)((0, _fs.openSync)(failFile, 'w'));
}

function deleteFailFile() {
  try {
    (0, _fs.unlinkSync)(failFile);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}
module.exports = exports['default'];
