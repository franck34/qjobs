
var EventEmitter = require('events').EventEmitter;

var maxConcurrency  = 10;
var jobsRunning = 0;
var jobsDone = 0;
var jobsTotal = 0;
var timeStart;
var jobId = 0;
var jobsList = [];
var paused = false;
var pausedId = null;
var lastPause = 0;

/*
 * helper to set max concurrency
 */
var setConcurrency = function(max) {
    maxConcurrency = max;
}


/*
 * add some jobs in the queue
 */
var add = function(job,args) {
    jobsList.push([job,args]);
    jobsTotal++;
}


/*
 * run the queue
 */
var run = function() {

    // first launch, let's emit start event
    if (jobsDone == 0) {
        module.exports.emit('start');
        timeStart = Date.now();
    }

    // while queue is empty and number of job running
    // concurrently are less than max job running,
    // then launch the next job
    while (jobsList.length && jobsRunning<maxConcurrency) {

        // get the next job and remove it from the queue
        var job = jobsList.shift();

        // increment number of job running
        jobsRunning++;

        // fetch args for the job
        var args = job[1];

        // add an internal identifiant for
        // hypothetical external use
        args._jobId = jobId++;

        // emit jobStart event before launch the job
        module.exports.emit('jobStart',args);

        // run the job, passing args, next() function,
        // binded to 'this'
        job[0](job[1],next.bind(this,args));

    }

    // if we really finish all the jobs, let's end
    if (jobsList.length==0 && jobsRunning==0) {
        // emit 'end' event
        module.exports.emit('end');
    }
}

/*
 * a task has been terminated,
 * so 'next()' has been called
 */
var next = function(args) {

    // update counters
    jobsRunning--;
    jobsDone++;

    // emit 'jobEnd' event
    module.exports.emit('jobEnd',args);

    // if queue has been set to pause
    // then do nothing
    if (paused) return;

    // else, execute run() function
    run();
}

/*
 * You can 'pause' jobs.
 * it will not pause running jobs, but
 * it will stop launching pending jobs
 * until paused = false
 */
var pause = function(status) {
    paused = status;
    if (!paused && pausedId) {
        clearInterval(pausedId);
        run();
    }
    if (paused && !pausedId) {
        lastPause = Date.now();
        pausedId = setInterval(function() {
            var since= Date.now() - lastPause;
            module.exports.emit('inPause',since);
        },1000);
    }
}

var stats = function() {

    var now =  Date.now();

    var o = {};
    o._timeStart = timeStart||'N/A';
    o._timeElapsed = now - timeStart||'N/A';
    o._jobsTotal = jobsTotal;
    o._jobsRunning = jobsRunning;
    o._jobsDone = jobsDone;
    o._progress = Math.floor((jobsDone/jobsTotal)*100);
    o._concurrency = maxConcurrency;
    if (paused) {
        o._status = 'Paused';
    } else {
        if (o._timeElapsed=='N/A') {
            o._status = 'Starting';
        } else {
            if (jobsTotal == jobsDone) {
                o._status = 'Finished';
            } else {
                o._status = 'Running';
            }
        }
    }
    return o;
}

module.exports = new EventEmitter();
module.exports.run = run;
module.exports.add = add;
module.exports.pause = pause;
module.exports.setConcurrency = setConcurrency;
module.exports.stats = stats;
