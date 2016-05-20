/**
 * Created by aghassaei on 1/17/15.
 */


define(['underscore', 'three', 'combinedCamera'], function(_, THREE){

    //var camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 60, 0.01, 1000, - 500, 1000 );
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.01, 1000);
//    camera.setLens(50);
    var scene = new THREE.Scene();
    var simScene = new THREE.Scene();
    var secondPassScene = new THREE.Scene();
    var firstPassScene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({antialias:true});//antialiasing is not supported in ff and on mac+chrome
    renderer.autoClear = false;

    var svgRenderer = null;

    var appState;
    require(['appState'], function(globalAppState){
        appState = globalAppState;
    });

    //store all meshes to highlight
    var cells = [];
//    var parts = [];
    var basePlane = [];

    var animationLoopRunning = false;
    var stopAnimationFlag = false;

    var shouldRender = false;

    var initialCameraPosition = new THREE.Vector3(-15, -12, 12);

    var threeView = null;

    var dragPlane = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({side: THREE.DoubleSide}));
    dragPlane.visible = false;
    firstPassScene.add(dragPlane);

    initialize();

    function initialize(){

        camera.up.set(0,0,1);//set z axis as "up"
        resetCameraPosition();

//        scene.fog = new THREE.FogExp2(fogColor, 0.001);

        // lights
        var color = 0x888888;
        var light = new THREE.DirectionalLight(color);
        light.position.set(0, 10, 0);
        scene.add(light);
        var light = new THREE.DirectionalLight(color);
        light.position.set(0, -10, 0);
        scene.add(light);
        var light = new THREE.DirectionalLight(color);
        light.position.set(0, 0, 300);
        scene.add(light);
        var light = new THREE.DirectionalLight(0xaaaaaa);
        light.position.set(-1, -1, -1);
        scene.add(light);
        var light = new THREE.DirectionalLight(0xaaaaaa);
        light.position.set(1, 1, -1);
        scene.add(light);
        var light = new THREE.AmbientLight(0x222222);
        scene.add(light);
        

        // renderer
        configRenderer(renderer);

        window.addEventListener('resize', onWindowResize, false);
    }

    function configRenderer(_renderer){
        var fogColor = 0xcccccc;
        _renderer.setClearColor(fogColor, 1);
        _renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function resetCameraPosition(){
        camera.position.x = initialCameraPosition.x;
        camera.position.y = initialCameraPosition.y;
        camera.position.z = initialCameraPosition.z;
        if (threeView) threeView.reset3DNavigation();
        render();
    }

    function orthographicCamera(){
        camera.toOrthographic();
    }

    function perspectiveCamera(){
        camera.toPerspective();
    }

    function onWindowResize(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function setThreeView(view){
        threeView = view;
    }

    function sceneAdd(object){
        scene.add(object);
    }

    function simSceneAdd(object){
        simSceneClear();
        simScene.add(object);
    }

    function secondPassSceneAdd(object){
        secondPassScene.add(object)
    }

    function sceneAddBasePlane(plane, lines){
        sceneAdd(lines);
        firstPassScene.add(plane);
        basePlane.push(plane.children[0]);
    }

    function getBasePlane(){
        return basePlane;
    }

    function addCell(cell){
        cells.push(cell);
    }

    function removeCell(cell){
        var index = cells.indexOf(cell);
        if (index < 0) return;
        cells.splice(index, 1);
    }

    function getCells(){
        return cells;
    }

    function setupDragPlane(position, orientation){
        var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), orientation.normalize());
        var euler = new THREE.Euler().setFromQuaternion(quaternion);
        dragPlane.position.set(position.x, position.y, position.z);
        dragPlane.rotation.set(euler.x, euler.y, euler.z);
        return dragPlane;
    }

    function sceneRemove(object){
        scene.remove(object);
    }

    function simSceneClear(){
        if (simScene.children.length>0) simScene.remove(simScene.children[0]);
    }

    function secondPassSceneRemove(object){
        secondPassScene.remove(object)
    }

    function sceneRemoveBasePlane(plane, lines){
        sceneRemove(lines);
        firstPassScene.remove(plane);
        basePlane = [];
    }

    function removeAllCells(){
        cells = [];
    }

    function startAnimationLoop(callback){
        if (appState.get("turnOffRendering") || animationLoopRunning) return;
        stopAnimationFlag = false;
        animationLoopRunning = true;
        console.log("animation started");
        _loop(callback);
    }

    function stopAnimationLoop(){
        if (!animationLoopRunning) return;
        stopAnimationFlag = true;
    }

    function _loop(callback){
        if (callback) callback();
        _render();
        if (stopAnimationFlag) {
            animationLoopRunning = false;
            console.log("animation stopped");
            return;
        }
        requestAnimationFrame(function(){_loop(callback);});
    }

    function render(){
        if (animationLoopRunning || (appState && appState.get("turnOffRendering"))) return;
        _render();
    }

    function _renderSim(){
//        console.log("render sim");
        renderer.clear();
        renderer.render(firstPassScene, camera);
        renderer.clearDepth();
        renderer.render(simScene, camera);
        renderer.clearDepth();
        renderer.render(secondPassScene, camera);
    }

    function _render(){
//        console.log("render");
        renderer.clear();
        renderer.render(firstPassScene, camera);
        renderer.clearDepth();
        renderer.render(scene, camera);
        renderer.clearDepth();
        renderer.render(secondPassScene, camera);
    }

    function setRenderFlag(){
        shouldRender = true;
    }

    function conditionalRender(){
        if (shouldRender) render();
        shouldRender = false;
    }

    function saveSVG(){
        require(['svgRenderer', 'fileSaver'], function(SVGRenderer, fileSaver){
            if (svgRenderer === null) {
                svgRenderer = new SVGRenderer();
            }
            configRenderer(svgRenderer);
            svgRenderer.render(scene, camera);
            var XMLS = new XMLSerializer();
            var svgfile = XMLS.serializeToString(svgRenderer.domElement);
            fileSaver.saveData(svgfile, "screenshot", "svg");
        })
    }

    function getGLContext(){
        return renderer.context;
    }

    function setBackgroundColor(color){
        renderer.setClearColor(color, 1);
    }

    return {//return public properties/methods
        render: render,
        conditionalRender: conditionalRender,
        setRenderFlag: setRenderFlag,
        startAnimationLoop: startAnimationLoop,
        stopAnimationLoop: stopAnimationLoop,
        sceneRemove: sceneRemove,
        simSceneRemove: simSceneClear,
        secondPassSceneRemove: secondPassSceneRemove,
        sceneAdd: sceneAdd,
        simSceneAdd: simSceneAdd,
        secondPassSceneAdd: secondPassSceneAdd,
        sceneAddBasePlane: sceneAddBasePlane,
        sceneRemoveBasePlane: sceneRemoveBasePlane,
        domElement: renderer.domElement,
        camera: camera,
        getCells: getCells,
        addCell: addCell,
        removeCell: removeCell,
        getBasePlane: getBasePlane,
        removeAllCells: removeAllCells,
        setupDragPlane: setupDragPlane,
        resetCameraPosition: resetCameraPosition,
        setThreeView: setThreeView,
        saveSVG: saveSVG,
        getGLContext: getGLContext,
        setBackgroundColor: setBackgroundColor,
        orthographicCamera: orthographicCamera,
        perspectiveCamera: perspectiveCamera
    }

});