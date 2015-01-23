/**
 * Created by aghassaei on 1/17/15.
 */


function ThreeModel(){

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 1000);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({antialias:false});
    var objects = [];

    initialize();

    function initialize(){

        camera.position.x = 125;
        camera.position.y = 100;
        camera.position.z = 165;
        camera.up.set(0,0,1);//set z axis as "up"

        scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

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

//    function drawRandomStuff(){
//        var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
//        var material = new THREE.MeshLambertMaterial({color:0xffffff, shading: THREE.FlatShading});
//
//        for ( var i = 0; i < 500; i ++ ) {
//            var mesh = new THREE.Mesh( geometry, material );
//            mesh.position.x = ( Math.random() - 0.5 ) * 1000;
//            mesh.position.y = ( Math.random() - 0.5 ) * 1000;
//            mesh.position.z = ( Math.random() - 0.5 ) * 1000;
//            mesh.updateMatrix();
//            mesh.matrixAutoUpdate = false;
//            scene.add(mesh);
//        }
//    }

    function onWindowResize(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function sceneAdd(object){
        scene.add(object);
        objects.push(object);
    }

    function sceneRemove(object){
        scene.remove(object);
        objects.remove(object);
    }

    function render(){
        renderer.render(scene, camera);
    }

    function clearAll(){
        var children = scene.children;
        for (var i=children.length;i>=0;i--){
            var object = children[i];
            if (object instanceof THREE.Mesh){// && object != this.fillGeometry.get("mesh")
                scene.remove(object);
            }
        }
        render();
    }

    return {//return public properties
        render:render,
        clearAll: clearAll,
        sceneRemove:sceneRemove,
        sceneAdd:sceneAdd,
        domElement:renderer.domElement,
        camera:camera,
        objects:objects
    }
}