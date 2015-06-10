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
            this._setPosition(object3D, 0);
            _.each(meshes, function(mesh){
                object3D.add(mesh);
            });
            object3D.myParent = this;
            this.set("object3D", object3D);
            three.sceneAddBasePlane(object3D);
            three.render();
            this._setVisibility();
        },

        updateXYSeparation: function(xySep) {},

        getAbsoluteOrientation: function(){
            console.log("baseplane orientation");
            return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI);
        },

        _setVisibility: function(){
            this.get("object3D").visible = appState.get("basePlaneIsVisible");
            three.render();
        },

        _setPosition: function(object3D, height){
            if (!object3D || object3D === undefined) object3D = this.get("object3D");
            object3D.position.set(0,0,height-lattice.zScale()/2);
        },

        getAbsoluteIndex: function(){
            return this.highligherIndex.clone();
        },

        calcHighlighterParams: function(face, point, index){//index comes from subclass
            point.z = 0;//todo this doesn't generalize when baseplane moves
            if (!index || index === undefined) index = lattice.getIndexForPosition(point);
            index.z = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
            var position = lattice.getPositionForIndex(index);
            position.z += lattice.zScale()/2;
            this.highligherIndex = index;
            return {direction: new THREE.Vector3(0,0,1), position:position};
        },

        _removeMesh: function(){
            this.get("object3D").myParent = null;
            three.sceneRemoveBasePlane(this.get("object3D"));
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