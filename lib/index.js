'use strict';

var Promise = require('bluebird');
var request = require('request');
var FeedParser = require('feedparser');
var colors = require('colors');

var mod = {
  read: read
};

/**
 * Read a feed.
 *
 * @param  object args feed options
 */
function read(args) {
  var url = args._[0];
  if (url) {
    fetch(url, args).then(parse).then(done).catch(done);
  } else {
    done(new Error('No feed URL provided'));
  }
}

/**
 * Fetch a feed based on options.
 *
 * @param  object args fetch request definition
 */
function fetch(url, args) {
  return new Promise(function(resolve, reject) {
    var req = request(
      url,
      {
        timeout: 10000,
        pool: false,
        proxy: args.proxy
      }
    );

    req.setMaxListeners(50);
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    // Define our handlers
    req.on('error', function(reason) {
      reject(reason);
    });

    req.on('response', function(res) {
      if (res.statusCode != 200) {
        reject(new Error('Bad status code'));
      }
      resolve(res);
    });
  });
}

/**
 * Parse server response.
 *
 * @param  object response server response
 */
function parse(response) {
  return new Promise(function (resolve, reject) {
    var feedparser = new FeedParser();

    feedparser.on('error', function (error) {
      reject(error);
    });

    feedparser.on('end', function () {
      resolve();
    });

    feedparser.on('readable', function() {
      var post;
      while (post = this.read()) {
        console.log(('* ' + post.title).bold);
        console.log(('  (' + post.link + ')').yellow);
        console.log();
      }
    });

    response.pipe(feedparser);
  });
}

/**
 * End of the process with or without error.
 *
 * @param  object   err error
 */
function done(err) {
  if (err) {
    console.log(err.stack);
    return process.exit(1);
  }

  process.exit();
}

exports = module.exports = mod;
