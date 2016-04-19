const chai = require("chai");
chai.should();
chai.use(require('chai-as-promised'));

const LastWordCreator = require('./');
const ms = require('ms');
const redis = require('redis');
const client = redis.createClient('redis://localhost');
const Promise = require('bluebird');

describe('Last Word', function() {
    this.timeout(ms('10s'))
    beforeEach(function(done) {
        client.flushall(done);
    });

    it('should limit requests', function() {
        const lastWord = LastWordCreator({
            limit: 3,
            timeLimit: ms('1s'),
            blockTime: ms('2s'),
            client: client,
            message: 'Limit Reached'
        });
        const key = 'spam_1'

        return Promise.join(
            lastWord(key),
            lastWord(key),
            lastWord(key),
            lastWord(key)
        ).should.be.rejectedWith(Error, 'Limit Reached');
    });

    it('should not throw error when time limit passed', function() {
        const lastWord = LastWordCreator({
            limit: 3,
            timeLimit: ms('1s'),
            blockTime: ms('2s'),
            client: client
        });
        const key = 'spam_2';
        return Promise.join(
            lastWord(key),
            lastWord(key),
            lastWord(key)
        ).then(function() {
            return Promise.delay(1001);
        }).then(function() {
            return lastWord(key);
        }).should.be.fulfilled;
    });

    it('should block user when he hit the limit', function() {
        const lastWord = LastWordCreator({
            limit: 2,
            timeLimit: ms('1s'),
            blockTime: ms('2s'),
            client: client,
            message: 'Limit Reached'
        });
        const key = 'spam_2';
        return Promise.join(
            lastWord(key),
            lastWord(key),
            lastWord(key)
        ).catch(function() {
            return lastWord(key);
        }).should.be.rejectedWith(Error, 'Limit Reached');
    });

    it('should unblock user when block limit pass', function() {
        const lastWord = LastWordCreator({
            limit: 2,
            timeLimit: ms('1s'),
            blockTime: ms('2s'),
            client: client
        });
        const key = 'spam_2';
        return Promise.join(
            lastWord(key),
            lastWord(key),
            lastWord(key)
        ).catch(function() {
            return Promise.delay(2001);
        }).then(function() {
            return lastWord(key);
        }).should.be.fulfilled;
    });
});
