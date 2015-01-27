/**
 * Created by aghassaei on 1/17/15.
 */


function ThreeModel(){

    var $el = $("#threeContainer");
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 4000);
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
        var objectToRemove = object;
        if (object.parent && object.parent.type != "Scene") {
            objectToRemove = object.parent;
        }
        scene.remove(objectToRemove);
        objects.splice(objects.indexOf(objectToRemove), 1);
    }

    function render(){
        console.log("render");
        renderer.render(scene, camera);
    }

    function clearAll(){
//        var children = objects.slice(0);
//        for (var i=children.length;i>=0;i--){
//            var object = children[i];
//            if (!(object instanceof THREE.Mesh)){// && object != this.fillGeometry.get("mesh")
//                scene.remove(object);
//                objects.splice(objects.indexOf(object), 1);
//            }
//        }
//        render();
    }

    return {//return public properties/methods
        render:render,
        clearAll: clearAll,
        sceneRemove:sceneRemove,
        sceneAdd:sceneAdd,
        domElement:renderer.domElement,
        camera:camera,
        objects:objects
    }
}