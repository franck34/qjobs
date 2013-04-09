**`qjobs` is a simple and stupid queue job manager for nodejs.**

* concurrency limiter
* dynamic queue (a job can be add while the queue is treated)
* event based, can be usefull to plug within pub/sub stuffs 
* non blocking (of course), but a job itself can run async code
* really simple to use
* really simple to understand




Example :

```

// My non blocking main task
var myTask = function(args,next) {

    // do nothing now but in 1 sec

    setTimeout(function() {

        // if i'm task id 10 or 20, let's add 
        // another task dynamicaly in the queue.
        // It can be usefull for network operation (retry on timeout) 

        if (args._taskId==10||args._taskId==20) {
            myQueueJobs.add(myTask,[999,'bla '+args._taskId]);
        }
        next();
    },1000);
}

// Notice the "new" before require, to be able to use more 
// than one queue independently
var myQueueJobs = new require('qjobs');

// Let's add 30 task and add them to the queue
for (var i = 0; i<30; i++) {
    myQueueJobs.add(myTask,[i,'test1']);
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
myQueueJobs.on('taskStart',function(args) {
    console.log('taskRun',args);
});

// I want to know when each job has ended
myQueueJobs.on('taskEnd',function(args) {

    console.log('taskend',args);
    
    // If i'm taskId 10, then make a pause of 5 sec

    if (args._taskId == 10) {
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


