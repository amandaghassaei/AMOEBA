//global workers so they do not have to be reinstantiated

function persistentWorkers(numWorkers){

    //check compatibility
    if (!(typeof window.Worker === "function")){
        console.log("workers not supported");
        return nil;
    }

    //create array of workers
    var allWorkers = [];
    var URL = window.URL || window.webkitURL;
    var workerURL = makeBlobURL(URL, myWorker);
    for (var i=0;i<numWorkers;i++){
        var worker = new Worker(workerURL);
        var location = document.location;
        worker.postMessage({url: location.toString()});
        worker.postMessage([i,4]);
        worker.onmessage = workerCallback;
        allWorkers.push(worker);
    }
    URL.revokeObjectURL(workerURL);

    function workerCallback(e){
        console.log(e.data);
    }

    function makeBlobURL(URL, someFunction) {
        var blob = new Blob(["(" + someFunction.toString() + ")()"], { type: "text/javascript" });
        return URL.createObjectURL(blob);
    }

}