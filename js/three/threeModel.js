/**
 * Created by ghassaei on 10/11/16.
 */

define(["jquery", "orbitControls", "backbone"], function($, THREE, Backbone){

    var numScenes = 1;
    var scenes = [];
    for (var i=0;i<numScenes;i++){
        scenes.push(new THREE.Scene());
    }
    var renderer = new THREE.WebGLRenderer({antialias:true});
    var controls;

    //store all things to highlight
    var cellContainer = new THREE.Object3D();

    var ThreeModel = Backbone.Model.extend({

        defaults:{
            cameraType: "perspective"
        },

        // var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 400);
        camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000),

        initialize: function() {

            this.listenTo(this, "change:cameraType", this.updateCamera);

            var container = $("#threeContainer");
            container.append(renderer.domElement);
            renderer.setSize(window.innerWidth, window.innerHeight);

            // camera.zoom = 30;
            this.camera.zoom = 10;
            this.camera.updateProjectionMatrix();
            this.camera.position.x = 100;
            this.camera.position.y = 100;
            this.camera.position.z = 100;
            scenes[0].add(this.camera);

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

            window.addEventListener('resize', this.onWindowResize, false);

            controls = new THREE.OrbitControls(this.camera, container.get(0));
            controls.addEventListener('change', this.render);
        },

        updateCamera: function() {
            console.log(this.get("cameraType"));
        },

        onWindowResize: function() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.left = -window.innerWidth / 2;
            this.camera.right = window.innerWidth / 2;
            this.camera.top = window.innerHeight / 2;
            this.camera.bottom = -window.innerHeight / 2;
            this.camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        },

        sceneAdd: function(object) {
            scenes[0].add(object);
        },

        sceneAddCell: function(object) {
            cellContainer.add(object);
        },

        sceneRemove: function(object) {
            scenes[0].remove(object);
        },

        sceneRemoveCell: function(object) {
            cellContainer.remove(object);
        },

        getCells: function() {
            return cellContainer.children;
        },

        removeAllCells: function() {
            cellContainer.children = [];
        },

        render: function() {
            _render();
        }
    });

    var threeModel = new ThreeModel();

    function _render() {
        renderer.clear();
        renderer.render(scenes[0], threeModel.camera);
    }

    threeModel.render();

    return threeModel;
});