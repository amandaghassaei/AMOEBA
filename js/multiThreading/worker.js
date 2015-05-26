/**
 * Created by aghassaei on 1/12/15.
 */

function myWorker(){

    //local variables
    var localEnv = null;//local variables passed in from outside
    var working = false;//boolean that says whether I'm busy or not
    var arg = null;//main data we are crunching
    var modelMesh = null;//hold on to this so we don't have to keep passing it in

    self.onmessage = function(e) {
        var data = e.data;

        if (data.url) {
            var url = data.url;
            var index = url.indexOf('index.html');//url of landing page
            if (index != -1) {
              url = url.substring(0, index);
            }
        //load all scripts
        //    importScripts(url + 'dependencies/three.js');
    //    importScripts(url + 'js/models/dmaBeam.js');
        }
//
        if (data.model){
            //var material = new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
            //modelMesh = new THREE.Mesh(JSON.parse(data.model), material);
        }

        if (data.executable){

            if (data.localEnv){//be sure to get local environment vars before executable runs
                localEnv = JSON.parse(data.localEnv);
            }
            if (data.arg){//be sure to get arg before executable runs
                arg = data.arg;
            }

            if (working) {
                console.log("problem here, already working on something else");
                return;
            }
            working = true;
            eval(data.executable);
            var result = executable(arg);
            working = false;
            postMessage({result:result, isWorking:working});
        }

        if (data.isWorking){
            postMessage({isWorking:working});
        }


    };
}
