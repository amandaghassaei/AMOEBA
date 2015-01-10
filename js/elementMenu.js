/**
 * Created by aghassaei on 1/8/15.
 */

var Parallel = Parallel || {};

$(function(){

    three = three || {};
    modelMesh = modelMesh || {};

    $("#elementCube").click(function(e){
        e.preventDefault();

        var cubeDim = 10;
        var boundingBox = new THREE.Box3();
        boundingBox.setFromObject(modelMesh);

        var xRange = [];
        for (var x=boundingBox.min.x;x<boundingBox.max.x;x+=cubeDim){
           xRange.push(x);
        }

        var threads = new Parallel(xRange, {env:{boundingBox:boundingBox, three:three, cubeDim:cubeDim, modelMesh:modelMesh}}).require(
            {fn:THREE.Vector3,name:'Vector3'}, {fn:THREE.Raycaster,name:'Raycaster'}, {fn:THREE.Ray,name:'Ray'},
            createCubeGeometry, {fn:THREE.BoxGeometry,name:'BoxGeometry'}, {fn:THREE.MeshLambertMaterial,name:'MeshLambertMaterial'},
            {fn:THREE.Geometry,name:'Geometry'}
        );
        threads.map(fillWithElements).then(three.render);

        function fillWithElements(x){
            var cubeDim = global.env.cubeDim;

            for (var y=global.env.boundingBox.min.y;y<global.env.boundingBox.max.y;y+=cubeDim){
                for (var z=global.env.boundingBox.min.z;z<global.env.boundingBox.max.z;z+=cubeDim){
                    var raycaster = new Raycaster(new Vector3(x+cubeDim/2, y+cubeDim/2, z+cubeDim/2),
                        new Vector3(0, 0, 1), 0, global.env.boundingBox.max.z-z+cubeDim/2);
//                    if (raycaster.intersectObject(global.env.modelMesh).length % 2 == 1) {
                        var mesh = createCubeGeometry(cubeDim);
                        mesh.position.set(x+cubeDim/2, y+cubeDim/2, z+cubeDim/2);
                        mesh.updateMatrix();
                        mesh.matrixAutoUpdate = false;
                        global.env.three.scene.add(mesh);
//                    }
                }
            }
        }
    });

    function createCubeGeometry(size){
        var geometry = new BoxGeometry(size, size, size);
        var material = new MeshLambertMaterial( { color:0xffffff} );
        return new THREE.Mesh( geometry, material );
    }

});