/**
 * Created by aghassaei on 1/31/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three'],
    function(_, Backbone, appState, lattice, three, THREE){

    return Backbone.Model.extend({

        defaults: {
            planeType: "xy",
            zIndex: 0,
            orientationFlipped: false,
            dimX: 100,
            dimY: 100,
            material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true})
        },
    
        initialize: function(){

            //bind events
            this.listenTo(this, "change:zIndex", this._zIndexChange);
            this.listenTo(appState, "change:basePlaneIsVisible", this._setVisibility);

            this.listenTo(this, "change:planeType", this._changePlaneType);
            this.listenTo(this, "change:orientationFlipped", this._changeOrientation);

            //draw mesh
            var meshes = this._makeBasePlaneMesh();
            var object3D = new THREE.Object3D();

            object3D.add(meshes[0]);
            object3D.myParent = this;
            this.lines = meshes[1];
            this.object3D = object3D;
            this._changePlaneType();

            three.sceneAddBasePlane(this.object3D, this.lines);
            three.render();
            this._setVisibility();
        },

        getNormalAxis: function(){
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
            var visible = appState.get("basePlaneIsVisible");
            this.object3D.visible = visible;
            this.lines.visible = visible;
            three.render();
        },

        _setRotation: function(x, y, z){
            this.object3D.rotation.set(x, y, z);
            this.lines.rotation.set(x, y, z);
        },

        _setPosition: function(height){
            var object3D = this.object3D;
            var lines = this.lines;
            object3D.position.set(0,0,0);
            lines.position.set(0,0,0);
            var normalAxis = this.getNormalAxis();
            var scale = lattice.getAspectRatio()[normalAxis];
            if (this.get("orientationFlipped")) height += 1;
            object3D.position[normalAxis] = height*scale-scale/2;
            lines.position[normalAxis] = object3D.position[normalAxis];
        },

        getIndex: function(){
            return this.highligherIndex.clone();
        },

        getPosition: function(){
            return lattice.getPositionForIndex(this.getIndex());
        },

        calcHighlighterParams: function(face, point, index){//index comes from subclass
            var normalAxis = this.getNormalAxis();
            var orientationFlipped = this.get("orientationFlipped");

            point[normalAxis] = this.object3D.position[normalAxis];
            if (orientationFlipped) point[normalAxis] += lattice.getAspectRatio()[normalAxis]/2;
            else point[normalAxis] -= lattice.getAspectRatio()[normalAxis]/2;

            if (!index || index === undefined) index = lattice.getIndexForPosition(point);
            //index[normalAxis] = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
            var position = lattice.getPositionForIndex(index);
            //if (orientationFlipped) index[normalAxis] -= lattice.getAspectRatio()[normalAxis]/2;

            if (orientationFlipped) position[normalAxis] -= lattice.getAspectRatio()[normalAxis]/2;
            else position[normalAxis] += lattice.getAspectRatio()[normalAxis]/2;
            this.highligherIndex = index;

            var direction = new THREE.Vector3(0,0,0);
            direction[normalAxis] = 1;
            if (orientationFlipped) direction[normalAxis] = -1;
            return {direction: direction, position:position};
        },

        _removeMesh: function(){
            this.object3D.myParent = null;
            three.sceneRemoveBasePlane(this.object3D, this.lines);
            three.render();
        },

        reset: function(){
            this.set(this.defaults);
        },

        destroy: function(){
            this.stopListening();
            this.set("zIndex", null, {silent:true});
            this._removeMesh();
            this.object3D = null;
            this.lines = null;
            this.set("material", null, {silent:true});
            this.set("unitGeometry", null, {silent:true});
            this.set("dimX", null, {silent:true});
            this.set("dimY", null, {silent:true});
        }
    });
});