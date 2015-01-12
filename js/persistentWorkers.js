//global workers so they do not have to be reinstantiated

function persistentWorkers(numWorkers){

    //check compatibility
    if (!(typeof window.Worker === "function")){
        console.log("workers not supported");
        return nil;
    }

    //local variables
    var allWorkers = [];
    var mapQueue = [];

    //create array of workers
    var URL = window.URL || window.webkitURL;
    var workerURL = makeBlobURL(URL, myWorker);
    for (var i=0;i<numWorkers;i++){
        var worker = new Worker(workerURL);
        worker.onmessage = onMessage;
        worker.postMessage({url: document.location.toString()});
        allWorkers.push(worker);
    }
    URL.revokeObjectURL(workerURL);

    function map(data, executable, env, incrCallback){

        //save args in map queue
        mapQueue.push({data:data, executable:executable, env:env, index:0, incrCallback:incrCallback, finished:false, activeThreads:0});

        for (var i=0;i<allWorkers.length;i++){
            allWorkers[i].postMessage({isWorking:true});//ask workers if they are busy
        }
    }

    function onMessage(e){

        if (e.data.result){//handle result first

            //get current work item off queue
            if (mapQueue.length == 0) return;
            var currentTask = mapQueue[0];
            currentTask.activeThreads--;//decrement active threads

            currentTask.incrCallback(e.data.result);//incremental callback
            if (currentTask.finished && currentTask.activeThreads == 0){
                mapQueue.shift();//remove first element
                console.log("end of task");
            }
        }

        var nextTask = getNextTask(mapQueue[0], 0);
        if (!nextTask) return;

        var currentIndex = nextTask.index;
        nextTask.index++;
        //check that the index is not out of bounds
        if (nextTask.data.length<=currentIndex){
            nextTask.finished = true;

            e.data.result = null;//remove result so it doesn't get handled twice
            onMessage(e);//try again in case there is another item in the queue to start
            return;
        }

        if (e.data.isWorking === false){
            nextTask.activeThreads++;
            e.target.postMessage({
                arg:nextTask.data[currentIndex],
                localEnv:nextTask.env,
                executable:nextTask.executable.toString()});
        }
    }

    function getNextTask(currentTask, index){
        if (!currentTask) return null;
        if (currentTask.finished){
            var nextIndex = index+1;
            if (mapQueue.length<=nextIndex) return null;
            return getNextTask(mapQueue[nextIndex]);
        } else {
            return currentTask;
        }
    }


    function incrementalCallback(){

    }

    function makeBlobURL(URL, someFunction) {
        var blob = new Blob(["(" + someFunction.toString() + ")()"], { type: "text/javascript" });
        return URL.createObjectURL(blob);
    }

    return {map:map};//return all public methods and vars

}