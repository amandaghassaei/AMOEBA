/**
 * Created by ghassaei on 10/11/16.
 */

define(["jquery", "orbitControls"], function($, THREE){

    // var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 400);
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
    var numScenes = 1;
    var scenes = [];
    for (var i=0;i<numScenes;i++){
        scenes.push(new THREE.Scene());
    }
    var renderer = new THREE.WebGLRenderer({antialias:true});
    var controls;

    //store all things to highlight
    var cellContainer = new THREE.Object3D();

    initialize();

    function initialize(){

        var container = $("#threeContainer");
        container.append(renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // camera.zoom = 30;
        camera.zoom = 10;
        camera.updateProjectionMatrix();
        camera.position.x = 100;
        camera.position.y = 100;
        camera.position.z = 100;
        scenes[0].add( camera );

        scenes[0].background = new THREE.Color(0xcccccc);
        // scenes[0].fog = new THREE.FogExp2( 0xcccccc, 1 );

        // lights
        var color = 0x888888;
        var light = new THREE.DirectionalLight(color);
        light.position.set(0, 10, 0);
        scenes[0].add(light);
        var light = new THREE.DirectionalLight(color);
        light.position.set(0, -10, 0);
        scenes[0].add(light);
        var light = new THREE.DirectionalLight(color);
        light.position.set(0, 0, 300);
        scenes[0].add(light);
        var light = new THREE.DirectionalLight(0xaaaaaa);
        light.position.set(-1, -1, -1);
        scenes[0].add(light);
        var light = new THREE.DirectionalLight(0xaaaaaa);
        light.position.set(1, 1, -1);
        scenes[0].add(light);
        var light = new THREE.AmbientLight(0x222222);
        scenes[0].add(light);

        //cell container
        scenes[0].add(cellContainer);

        window.addEventListener('resize', onWindowResize, false);

        controls = new THREE.OrbitControls(camera, container.get(0));
        controls.addEventListener('change', render);

        render();
    }

    function onWindowResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.left = -window.innerWidth / 2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = -window.innerHeight / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function sceneAdd(object){
        scenes[0].add(object);
    }

    function sceneAddCell(object){
        cellContainer.add(object);
    }

    function sceneRemove(object){
        scenes[0].remove(object);
    }

    function sceneRemoveCell(object){
        cellContainer.remove(object);
    }

    function getCells(){
        return cellContainer.children;
    }

    function removeAllCells(){
        cellContainer.children = [];
    }

    function render(){
        _render();
    }

    function _render(){
        renderer.clear();
        renderer.render(scenes[0], camera);
    }

    return {//return public properties/methods
        render: render,

        sceneAdd: sceneAdd,
        sceneAddCell: sceneAddCell,

        sceneRemove: sceneRemove,
        sceneRemoveCell: sceneRemoveCell,
        removeAllCells: removeAllCells,

        camera: camera,

        getCells: getCells,
        removeAllCells: removeAllCells
    }

});