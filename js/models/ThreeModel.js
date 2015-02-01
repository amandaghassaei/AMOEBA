/**
 * Created by aghassaei on 1/17/15.
 */


function ThreeModel(){

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 4000);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({antialias:false});

    //store all meshes to highlight
    var cells = [];
    var parts = [];
    var basePlane = [];

    initialize();

    function initialize(){

        camera.position.x = 125;
        camera.position.y = 100;
        camera.position.z = 165;
        camera.up.set(0,0,1);//set z axis as "up"

        scene.fog = new THREE.FogExp2(0xcccccc, 0.001);

        // lights
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        scene.add(light);
        light = new THREE.DirectionalLight(0x002288);
        light.position.set(-1, -1, -1);
        scene.add(light);
        light = new THREE.AmbientLight(0x222222);
        scene.add(light);

        // renderer
        renderer.setClearColor(scene.fog.color, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function sceneAdd(object, type){
        scene.add(object);

        if (type == "cell"){
            cells.push(object);
        } else if (type == "part"){
            parts.push(object);
        } else if (type == "basePlane"){
            basePlane.push(object);
        }

    }

    function sceneRemove(object, type){

        var objectToRemove = object;
        if (object.parent && object.parent.type != "Scene") {
            objectToRemove = object.parent;
        }

        if (type == "cell"){
            cells.splice(cells.indexOf(objectToRemove), 1);
        } else if (type == "part"){
            parts.splice(parts.indexOf(objectToRemove), 1);
        } else if (type == "basePlane"){
            basePlane = [];
        }

        scene.remove(objectToRemove);
    }

    function removeAllCells(){
        _.each(cells, function(cell){
            sceneRemove(cell, "cell");
        });
        _.each(parts, function(part){
            sceneRemove(part, "part");
        });
        cells = [];
        parts = [];
    }

    function render(){
        renderer.render(scene, camera);
    }

    return {//return public properties/methods
        render: render,
        sceneRemove: sceneRemove,
        sceneAdd: sceneAdd,
//        scene: scene,
        domElement: renderer.domElement,
        camera: camera,
        cells: cells,
        parts: parts,
        basePlane: basePlane,
        removeAllCells: removeAllCells
    }
}