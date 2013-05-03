#!/usr/bin/env node
var assert = require('assert');
var q = new require('../qjobs');

var maxConcurrency = 2;

var testExecutedJobs = 0;

var myjob = function(args,next) {
    setTimeout(function() {
        testExecutedJobs++;
        next();
    },50);
}

// only 2 jobs in the same time
q.setConcurrency(maxConcurrency);

// Let's add 10 job and add them to the queue
for (var i = 0; i<10; i++) {
    q.add(myjob,['test'+i]);
}

q.on('end',function() {
    assert.ok(testExecutedJobs, 10);
});

q.run();


