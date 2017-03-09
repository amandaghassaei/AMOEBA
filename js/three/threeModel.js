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

    var threeModel = null;

    var ThreeModel = Backbone.Model.extend({

        defaults:{
            cameraType: "perspective",
            cameraZoom: 10,
            cameraPosition: new THREE.Vector3(100, 100, 100),
            cameraLookAt: new THREE.Vector3(0,0,0)
        },

        camera: null,

        initialize: function() {

            _.bindAll(this, "updateCameraType", "onWindowResize");

            this.updateCameraType();

            var self = this;
            this.listenTo(this, "change:cameraType", this.updateCameraType);
            this.listenTo(this, "change:cameraZoom", function(){
                self.camera.zoom = self.get("cameraZoom");
                self.camera.updateProjectionMatrix();
                self.render();
            });
            this.listenTo(this, "change:cameraPosition", function(){
                var position = this.get("cameraPosition");
                this.camera.position.set(position.x, position.y, position.z);
                this.camera.lookAt(this.get("cameraLookAt"));
                self.render();
            });
            this.listenTo(this, "change:cameraLookAt", function(){
                var lookAt = this.get("cameraLookAt");
                controls.target.set(lookAt.x, lookAt.y, lookAt.z);
                self.render();
            });

            var container = $("#threeContainer");
            container.append(renderer.domElement);
            renderer.setSize(window.innerWidth, window.innerHeight);

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
            var self = this;
            controls.addEventListener('change', function(){
                self.set("cameraZoom", self.camera.zoom, {silent:true});
                self.set("cameraPosition", self.camera.position.clone(), {silent:true});
                self.set("cameraLookAt", controls.target.clone(), {silent:true});
                self.trigger("change");
                self.render();
            });
        },

        updateCameraType: function() {
            if (this.camera) scenes[0].remove(this.camera);
            if (this.get("cameraType") == "perspective"){
                this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);

            } else {
                this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 5000);
            }
            if (controls) controls.object = this.camera;
            scenes[0].add(this.camera);
            this.camera.zoom = this.get("cameraZoom");
            var position = this.get("cameraPosition");
            this.camera.position.set(position.x, position.y, position.z);
            this.camera.updateProjectionMatrix();
            if (threeModel) this.render();
        },

        onWindowResize: function() {
            if (this.get("cameraType") == "perspective"){
                this.camera.aspect = window.innerWidth / window.innerHeight;
            } else {
                this.camera.left = -window.innerWidth / 2;
                this.camera.right = window.innerWidth / 2;
                this.camera.top = window.innerHeight / 2;
                this.camera.bottom = -window.innerHeight / 2;
            }
            this.camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            this.render();
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

    threeModel = new ThreeModel();

    function _render() {
        renderer.clear();
        renderer.render(scenes[0], threeModel.camera);
    }

    threeModel.render();

    return threeModel;
});