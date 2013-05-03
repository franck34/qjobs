https://travis-ci.org/franck34/qjobs.png

**qjobs is a simple and stupid queue job manager for nodejs.**

* concurrency limiter
* dynamic queue (a job can be add while the queue is treated)
* event based, can be usefull to plug within pub/sub stuffs 
* non blocking (of course), but a job itself can run async code
* really simple to use
* really simple to understand


**Compatibility :**
* not tested with nodejs < 0.10


**Example :**

```

// My non blocking main job
var myjob = function(args,next) {

    // do nothing now but in 1 sec

    setTimeout(function() {

        // if i'm job id 10 or 20, let's add 
        // another job dynamicaly in the queue.
        // It can be usefull for network operation (retry on timeout) 

        if (args._jobId==10||args._jobId==20) {
            myQueueJobs.add(myjob,[999,'bla '+args._jobId]);
        }
        next();
    },1000);
}

// Notice the "new" before require, to be able to use more 
// than one queue independently
var myQueueJobs = new require('qjobs');

// Let's add 30 job and add them to the queue
for (var i = 0; i<30; i++) {
    myQueueJobs.add(myjob,[i,'test1']);
}

// I want to know when the first job has started
myQueueJobs.on('start',function() {
    console.log('starting ...');
});

// I want to know when the last job has ended
myQueueJobs.on('end',function() {
    console.log('end');
});

// I want to know when each job has started
myQueueJobs.on('jobStart',function(args) {
    console.log('jobRun',args);
});

// I want to know when each job has ended
myQueueJobs.on('jobEnd',function(args) {

    console.log('jobend',args);
    
    // If i'm jobId 10, then make a pause of 5 sec

    if (args._jobId == 10) {
        myQueueJobs.pause(true);
        setTimeout(function() {
            myQueueJobs.pause(false);
        },5000);
    }
});

// I want to know if queue is in pause every sec
myQueueJobs.on('inPause',function(since) {
    console.log('in pause since '+since+' milliseconds');
});


// JOBS !! leeeeeeeeeet's staaaaaaaart !
myQueueJobs.run();


