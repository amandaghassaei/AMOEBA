/**
 * Created by aghassaei on 1/12/15.
 */

function myWorker(){
    self.onmessage = function(e) {
        var data = e.data;

        if (data.url) {
            var url = data.url;
            var index = url.indexOf('main.html');//url of landing page
            if (index != -1) {
              url = url.substring(0, index);
            }
        //load all scripts
        importScripts(url + 'dependencies/three.js');
    //    importScripts(url + 'js/element.js');
            return;
        }


        console.log(new THREE.Vector3(0,3,4));
        var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
        postMessage(workerResult);

    };
}
