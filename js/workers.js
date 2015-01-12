//global workers so they do not have to be reinstantiated

function makeWorkers(){

    function makeURL(myWorkerFunction) {
        var URL = window.URL || window.webkitURL;
        var blob = new Blob([myWorkerFunction.toString()], { type: "text/javascript" });
        return URL.createObjectURL(blob);
    }

    function workerFunction(){
//        var isNode = typeof module !== 'undefined' && module.exports;
//
//        if (isNode) {
//            process.once('message', function (code) {
//                eval(JSON.parse(code).data);
//            });
//        } else {
        console.log("eval");
            self.onmessage = function (code) {
                console.log(code);
                eval(code.data);
            };
//        }
    }
    return new Parallel(null, {env:null, evalPath: "dependencies/eval.js"}).require('three.js');
}