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

        var localEnv = {boundingBox:boundingBox,cubeDim:cubeDim,modelMesh:modelMesh};

//        workers.map(xRange, fillWithElements, localEnv, incrCallback);
        for (x=boundingBox.min.x;x<boundingBox.max.x;x+=cubeDim){
            var boxOrigins = fillWithElements(x);
            _.each(boxOrigins, function(origin){
                var mesh = createCubeGeometry(cubeDim);
                mesh.position.set(origin[0], origin[1], origin[2]);
                mesh.updateMatrix();
                mesh.matrixAutoUpdate = false;
                three.scene.add(mesh);
            });
        }
        three.render();

        function incrCallback(result){
            console.log(result);
        }


        function fillWithElements(x){
            var origins = [];
            var cubeDim = localEnv.cubeDim;
            var boundingBox = localEnv.boundingBox;
            for (var y=boundingBox.min.y;y<boundingBox.max.y;y+=cubeDim){
                for (var z=boundingBox.min.z;z<boundingBox.max.z;z+=cubeDim){
                    var raycaster = new THREE.Raycaster(new THREE.Vector3(x+cubeDim/2, y+cubeDim/2, z+cubeDim/2),
                        new THREE.Vector3(0, 0, 1), 0, boundingBox.max.z-z+cubeDim/2);
                    var numIntersections = raycaster.intersectObject(modelMesh).length;
                    if (numIntersections % 2 == 1){
                        origins.push([x,y,z]);
                    } else if (numIntersections == 0){
                        break;
                    }
                }
            }
            return origins;
        }
    });

    function createCubeGeometry(size){
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = new THREE.MeshLambertMaterial( { color:0xffffff} );
        return new THREE.Mesh( geometry, material );
    }

});