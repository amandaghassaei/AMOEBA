/**
 * Created by aghassaei on 1/31/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three'],
    function(_, Backbone, appState, lattice, three, THREE){

    return Backbone.Model.extend({

        defaults: {
            zIndex: 0,
            object3D: null,
            dimX: 100,
            dimY: 100,
            material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true})
        },
    
        initialize: function(){

            //bind events
            this.listenTo(this, "change:zIndex", this._renderZIndexChange);
            this.listenTo(appState, "change:basePlaneIsVisible", this._setVisibility);

            //draw mesh
            var meshes = this._makeBasePlaneMesh();
            var object3D = new THREE.Object3D();
            _.each(meshes, function(mesh){
                object3D.add(mesh);
            });
            object3D.myParent = this;
            this.set("object3D", object3D);
            three.sceneAdd(object3D, "basePlane");
            three.render();
            this._setVisibility();
        },

        updateXYSeparation: function(xySep) {},

        getOrientation: function(){
            return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI);
        },

        _setVisibility: function(){
            this.get("object3D").visible = appState.get("basePlaneIsVisible");
            three.render();
        },

        getIndex: function(){
            return this.index.clone();
        },

        _removeMesh: function(){
            this.get("object3D").myParent = null;
            three.sceneRemove(this.get("object3D"), "basePlane");
            three.render();
        },

        destroy: function(){
            this.stopListening();
            this.set("zIndex", null, {silent:true});
            this._removeMesh();
            this.set("object3D", null, {silent:true});
            this.set("material", null, {silent:true});
            this.set("unitGeometry", null, {silent:true});
            this.set("dimX", null, {silent:true});
            this.set("dimY", null, {silent:true});
        }
    });
});