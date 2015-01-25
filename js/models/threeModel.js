/**
 * Created by aghassaei on 1/17/15.
 */


function ThreeModel(){

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 2000);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({antialias:false});
    var objects = [];

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

    function sceneAdd(object, noInteraction){
        scene.add(object);
        if (noInteraction) return;
        objects.push(object);
    }

    function sceneRemove(object){
        scene.remove(object);
        objects.remove(object);
    }

    function render(){
        console.log("render");
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