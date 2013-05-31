[![Build Status](https://secure.travis-ci.org/franck34/qjobs.png)](http://travis-ci.org/franck34/qjobs)

**qjobs**
***Efficient queue job manager module for nodejs.***
==================

**Features**
* Concurrency limiter
* Dynamic queue, a job can be added while the queue is running
* Optional delay before continuing after max concurrency has been reached
* Support of pause/unpause
* Events emitter based: start, end, sleep, continu, jobStart, jobEnd
* Quick statistic function, so you can know where the queue is, at regular interval

**For what it can be usefull ?**

Jobs which needs to run in parallels, but in a controled maner, example: 
* Network scanners
* Parallels monitoring jobs
* Images/Videos related jobs 


**Compatibility :**
* not tested with nodejs < 0.10


**Example :**

(take a look at tests directory if you are looking for running samples)


```
// My non blocking main job
var myjob = function(args,next) {
    setTimeout(function() {
        console.log('Do something interesting here',args);
        next();
    },1000);
}

// qjobs stuff

var myQueueJobs = new require('qjobs');

// Let's add 30 job to the queue
for (var i = 0; i<30; i++) {
    myQueueJobs.add(myjob,[i,'test '+i]);
}

// Initialize all events
myQueueJobs.on('start',function() {
    console.log('Starting ...');
});

myQueueJobs.on('end',function() {
    console.log('... All jobs done');
});

myQueueJobs.on('jobStart',function(args) {
    console.log('jobStart',args);
});

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


