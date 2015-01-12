//global workers so they do not have to be reinstantiated


function browserSupportsWebWorkers() {
  return typeof window.Worker === "function";
}

function makeWorkers(numWorkers){

    var allWorkers = [];
    var URL = window.URL || window.webkitURL;
    var workerURL = makeBlobURL(URL, myWorker);
    for (var i=0;i<numWorkers;i++){
        var worker = new Worker(workerURL);
        worker.postMessage([i,4]);

        worker.onmessage = function(e) {
          console.log(e.data);
        };
        allWorkers.push(worker);
    }
    URL.revokeObjectURL(workerURL);


    function makeBlobURL(URL, someFunction) {
        var blob = new Blob(["(" + someFunction.toString() + ")()"], { type: "text/javascript" });
        return URL.createObjectURL(blob);
    }

}