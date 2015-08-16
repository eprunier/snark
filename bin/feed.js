'use strict';

var minimist = require('minimist');
var feedClient = require('..');

feedClient.read(getOptions());

/**
* Parse command line arguments.
*/
function getOptions() {
  var config = {
    'alias': {
      'p': 'proxy'
    }
  };

  var args = process.argv.slice(2);
  return minimist(args, config);
}
