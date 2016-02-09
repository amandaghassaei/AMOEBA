/**
 * Created by aghassaei on 1/31/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three'],
    function(_, Backbone, appState, lattice, three, THREE){

    return Backbone.Model.extend({

        defaults: {
            planeType: "xy",
            zIndex: 0,
            dimX: 100,
            dimY: 100,
            material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true})
        },
    
        initialize: function(){

            //bind events
            this.listenTo(this, "change:zIndex", this._zIndexChange);
            this.listenTo(appState, "change:basePlaneIsVisible", this._setVisibility);

            this.listenTo(this, "change:planeType", this._changePlaneType);

            //draw mesh
            var meshes = this._makeBasePlaneMesh();
            var object3D = new THREE.Object3D();
            this._setPosition(object3D, 0);
            _.each(meshes, function(mesh){
                object3D.add(mesh);
            });
            object3D.myParent = this;
            this.object3D = object3D;
            three.sceneAddBasePlane(object3D);
            three.render();
            this._setVisibility();
        },

        _normalAxis: function(){
            var type = this.get("planeType");
            if (type == "xy") return "z";
            else if (type == "yz") return "x";
            return "y";
        },

//        getAbsoluteOrientation: function(){
//            var vector = new THREE.Vector3(0,0,0);
//            vector[this._normalAxis()] = 1;
//            return new THREE.Quaternion().setFromAxisAngle(vector, Math.PI);
//        },

        _setVisibility: function(){
            this.object3D.visible = appState.get("basePlaneIsVisible");
            three.render();
        },

        _setPosition: function(object3D, height){
            if (!object3D || object3D === undefined) object3D = this.object3D;
            object3D.position.set(0,0,0);
            var normalAxis = this._normalAxis();
            object3D.position[normalAxis] = height-lattice.getAspectRatio()[normalAxis]/2;
        },

        getAbsoluteIndex: function(){
            return this.highligherIndex.clone();
        },

        getAbsolutePosition: function(){
            return lattice.getPositionForIndex(this.getAbsoluteIndex());
        },

        calcHighlighterParams: function(face, point, index){//index comes from subclass
            var normalAxis = this._normalAxis();
            point[normalAxis] = this.object3D.position[normalAxis];
            if (!index || index === undefined) index = lattice.getIndexForPosition(point);
            index[normalAxis] = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
            var position = lattice.getPositionForIndex(index);
            position[normalAxis] += lattice.getAspectRatio()[normalAxis]/2;
            this.highligherIndex = index;
            var direction = new THREE.Vector3(0,0,0);
            direction[normalAxis] = 1;
            return {direction: direction, position:position};
        },

        _removeMesh: function(){
            this.object3D.myParent = null;
            three.sceneRemoveBasePlane(this.object3D);
            three.render();
        },

        destroy: function(){
            this.stopListening();
            this.set("zIndex", null, {silent:true});
            this._removeMesh();
            this.object3D = null;
            this.set("material", null, {silent:true});
            this.set("unitGeometry", null, {silent:true});
            this.set("dimX", null, {silent:true});
            this.set("dimY", null, {silent:true});
        }
    });
});