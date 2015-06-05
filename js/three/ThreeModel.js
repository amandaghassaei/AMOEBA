/**
 * Created by aghassaei on 1/17/15.
 */


define(['underscore', 'three'], function(_, THREE){

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.01, 5000);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({antialias:true});//antialiasing is not supported in ff and on mac+chrome

    //store all meshes to highlight
    var cells = [];
//    var parts = [];
    var basePlane = [];

    var animationLoopRunning = false;
    var stopAnimationFlag = false;

    initialize();

    function initialize(){

        camera.position.x = 15;
        camera.position.y = 12;
        camera.position.z = 12;
        camera.up.set(0,0,1);//set z axis as "up"

        scene.fog = new THREE.FogExp2(0xcccccc, 0.000);

        // lights
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        scene.add(light);
        light = new THREE.DirectionalLight(0xaaaaaa);
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

    function sceneAdd(object){
        scene.add(object);
    }

    function sceneAddBasePlane(object){
        sceneAdd(object);
        basePlane.push(object.children[0]);
    }

    function getBasePlane(){
        return basePlane;
    }

    function addCell(cell){
        cells.push(cell);
    }

    function removeCell(cell){
        cells.splice(cells.indexOf(cell), 1);
    }

    function getCells(){
        return cells;
    }

    function sceneRemove(object){
        scene.remove(object);
    }

    function sceneRemoveBasePlane(object){
        sceneRemove(object);
        basePlane = [];
    }

    function removeAllCells(){
        cells = [];
    }

    function startAnimationLoop(){
        if (animationLoopRunning) return;
        stopAnimationFlag = false;
        animationLoopRunning = true;
        console.log("animation started");
        _loop();
    }

    function stopAnimationLoop(){
        if (!animationLoopRunning) return;
        stopAnimationFlag = true;
    }

    function _loop(){
        _render();
        if (stopAnimationFlag) {
            animationLoopRunning = false;
            console.log("animation stopped");
            return;
        }
        requestAnimationFrame(_loop);
    }

    function render(){
        if (animationLoopRunning) return;
        _render();
    }

    function _render(){
        renderer.render(scene, camera);
    }

    return {//return public properties/methods
        render: render,
        startAnimationLoop: startAnimationLoop,
        stopAnimationLoop: stopAnimationLoop,
        sceneRemove: sceneRemove,
        sceneAdd: sceneAdd,
        sceneAddBasePlane: sceneAddBasePlane,
        sceneRemoveBasePlane: sceneRemoveBasePlane,
        domElement: renderer.domElement,
        camera: camera,
        getCells: getCells,
        addCell: addCell,
        removeCell: removeCell,
        getBasePlane: getBasePlane,
        removeAllCells: removeAllCells
    }

});