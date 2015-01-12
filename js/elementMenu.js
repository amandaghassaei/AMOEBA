/**
 * Created by aghassaei on 1/8/15.
 */

$(function(){

    three = three || {};
    modelMesh = modelMesh || {};
    workers = workers || {};

    $("#elementCube").click(function(e){
        e.preventDefault();

        var cubeDim = 10;
        var boundingBox = new THREE.Box3();
        boundingBox.setFromObject(modelMesh);

        var xRange = [];
        for (var x=boundingBox.min.x;x<boundingBox.max.x;x+=cubeDim){
           xRange.push(x);
        }

        var localEnv = {boundingBox:boundingBox,
        cubeDim:cubeDim,
        modelMesh:modelMesh};

        workers.map(xRange, fillWithElements, localEnv, incrCallback);


        function incrCallback(result){
            console.log(result);
        }

        function merge(meshes){
            var allMeshes = meshes[1];
            for (var i=2;i<meshes.length;i++){
                allMeshes.concat(meshes[i]);
            }
            return allMeshes;
        }

        function addToScene(arguments){
//            console.log("amanda");
//            console.log(arguments.length);
//            _.each(arguments, function(mesh){
//                three.scene.add(mesh);
//            });
            three.render();
        }

        function fillWithElements(x){
            var meshesToAdd = [];
            var cubeDim = localEnv.cubeDim;
            var boundingBox = localEnv.boundingBox;
//            for (var y=boundingBox.min.y;y<boundingBox.max.y;y+=cubeDim){
////                if ()
//                for (var z=boundingBox.min.z;z<boundingBox.max.z;z+=cubeDim){
//                    var raycaster = new THREE.Raycaster(new THREE.Vector3(x+cubeDim/2, y+cubeDim/2, z+cubeDim/2),
//                        new THREE.Vector3(0, 0, 1), 0, boundingBox.max.z-z+cubeDim/2);
//                    var numIntersections = raycaster.intersectObject(localEnv.modelMesh).length;
//                    if (numIntersections % 2 == 1) {
//                        var mesh = createCubeGeometry(cubeDim);
//                        mesh.position.set(x+cubeDim/2, y+cubeDim/2, z+cubeDim/2);
//                        mesh.updateMatrix();
//                        mesh.matrixAutoUpdate = false;
//                        meshesToAdd.push(mesh);
////                        global.env.three.scene.add(mesh);
//                    } else if (numIntersections == 0){
//                    }
//                }
//            }
            return x*x;
        }
    });

    function createCubeGeometry(size){
        console.log(cubeGeo);
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = new THREE.MeshLambertMaterial( { color:0xffffff} );
        return new THREE.Mesh( geometry, material );
    }

});