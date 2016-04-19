const defaults = require('defaults');
const ms = require('ms');
const Promise = require('bluebird');

module.exports = function(_options) {
    options = defaults(_options, {
        limit: 10,
        timeLimit: ms('30s'),
        blockTime: ms('5m'),
        Error: Error,
        message: 'Request limit reached',
    });

    const client = options.client;
    if (!client) {
        throw new Error('Please provide redis client');
    }

    var throwError = function() {
        throw new options.Error(options.message);
    };

    client.incrAsync = Promise.promisify(client.incr);
    client.pexpireAsync = Promise.promisify(client.pexpire);

    return function(key) {
        return client.incrAsync(key).then(function(requests) {
            if (requests == 1) {
                return client.pexpireAsync(key, options.timeLimit);
            }

            if (requests == (options.limit + 1)) {
                return client.pexpireAsync(key, options.blockTime).then(throwError);
            }

            if (requests > options.limit) {
                throwError();
            }
        }.bind(this));
    };
}
