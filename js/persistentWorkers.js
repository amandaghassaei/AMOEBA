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
        worker.onmessage = workerCallback;
        worker.postMessage({url: document.location.toString()});
        allWorkers.push(worker);
    }
    URL.revokeObjectURL(workerURL);

    function map(data, executable, env){

        //save args in map queue
        mapQueue.push({data:data, executable:executable, env:env, index:0});

        for (var i=0;i<allWorkers.length;i++){
            allWorkers[i].postMessage({isWorking:true});//ask workers if they are busy
        }
    }

    function workerCallback(e){

        if (e.data.result) console.log(e.data.result);//handle result first

        if (e.data.isWorking === false){
            //get next work item off queue
            if (mapQueue.length == 0) return;

            var currentTask = mapQueue[0];
            var currentIndex = currentTask.index;
            currentTask.index = currentTask.index+1;

            //check that the index is not out of bounds
            if (currentTask.data.length<=currentIndex){
                mapQueue.shift();//remove first element

                e.data.result = null;//remove result so it doesn't get handled twice
                workerCallback(e);//try again in case there is another item in the queue
                return;
            }

            e.target.postMessage({
                arg:currentTask.data[currentIndex],
                localEnv:currentTask.env,
                executable:currentTask.executable.toString()});
        }
    }

    function makeBlobURL(URL, someFunction) {
        var blob = new Blob(["(" + someFunction.toString() + ")()"], { type: "text/javascript" });
        return URL.createObjectURL(blob);
    }

    return {map:map}//return all public methods and vars

}