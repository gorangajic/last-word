# Last Word

> promise based redis request limiter

<img src="https://rawgit.com/gorangajic/last-word/master/last-word.png" width="60" alt="Last Word">

[![Build Status](https://semaphoreci.com/api/v1/gorangajic/last-word/branches/master/badge.svg)](https://semaphoreci.com/gorangajic/last-word)

```
    npm install last-word --save
```

### Usage example

```javascript
const ms = require('ms');
const lastWord = require('last-word')({
    limit: 3, // number of request before blocked
    timeLimit: ms('1s'), // time in milliseconds when number of requests are cleared
    blockTime: ms('2s'), // block time when
    client: client, // instance of the redis client
    message: 'Limit Reached', // Your custom error message
    Error: YourNewAwesomeError, // Your custom error type
});

app.get('/message', function(req, res, next){
    const key = 'spam_' + req.user.id;
    lastWord(key).then(function() {
        // do your magic here
    }).catch(next);
});

```
### Options that Last Word accepts

Name                | Description                                                    | Default
--------------------|----------------------------------------------------------------|---------------
client(required)    | instance of the redis client                                   | `null`
limit               | Number of request before blocked                               | `10`
timeLimit           | time in milliseconds when number of requests are cleared       | `ms('30s')`
blockTime           | How long request key will be blocked, after reaching the limit | `ms('5m')`
message             | Custom error message                                           | `Request limit reached`
Error               | Custom error type                                              | `Error`


### Licence

MIT

### Name

name is taken from one of the spells of dota 2 silencer hero
