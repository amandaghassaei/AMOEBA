/**
 * Created by ghassaei on 10/11/16.
 */


define(["three", "backbone", "appState", "lattice", "threeModel"],
    function(THREE, Backbone, appState, lattice, three){

    var plane = new THREE.Plane(new THREE.Vector3(0,1,0));

    var BasePlane = Backbone.Model.extend({

        defaults: {
            planeType: "xz",
            position: new THREE.Vector3(0,0,0),
            dimensions: new THREE.Vector2(100,100)
        },

        initialize: function(){

            //bind events
            this.listenTo(appState, "change:baseplaneIsVisible", this._setVisibility);
            this.listenTo(lattice, "change:aspectRatio", this._scaleBasePlane);

            //draw mesh
            this.object3D = this._makeMesh();
            this._scaleBasePlane();
            three.sceneAdd(this.object3D);
            this._setVisibility();
        },

        _makeMesh: function(){
            var dimensions = this.get("dimensions");
            var geometry = new THREE.Geometry();
            for (var i=-dimensions.y;i<=dimensions.y+1;i++) {
                geometry.vertices.push(new THREE.Vector3(-dimensions.x - 0.5, 0, i - 0.5));
                geometry.vertices.push(new THREE.Vector3(dimensions.x + 0.5, 0, i - 0.5));
            }
            for (var i=-dimensions.x;i<=dimensions.x+1;i++) {
                geometry.vertices.push(new THREE.Vector3(i - 0.5, 0, -dimensions.y - 0.5));
                geometry.vertices.push(new THREE.Vector3(i - 0.5, 0, dimensions.y + 0.5));
            }
            return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:0.2}));
        },

        _scaleBasePlane: function(){
            var aspectRatio = lattice.getAspectRatio();
            this.object3D.scale.set(aspectRatio.x, aspectRatio.y, aspectRatio.z);
        },

        getNormalAxis: function(){
            var type = this.get("planeType");
            if (type == "xy") return "z";
            else if (type == "yz") return "x";
            return "y";
        },

        getHighlighterPosition: function(intersection){
            var aspectRatio = lattice.getAspectRatio();
            var halfAspectRatio = aspectRatio.clone().multiplyScalar(0.5);
            var normalAxis = this.getNormalAxis();
            var position = intersection.add(halfAspectRatio).divide(aspectRatio).floor().multiply(aspectRatio);
            position[normalAxis] = this.get("position")[normalAxis];
            return {position: position, normal: normalAxis};

        },

        getIntersectionPlane: function(){
            if (this.object3D.visible) return plane;
        },

        _setVisibility: function(){
            var visible = appState.get("baseplaneIsVisible");
            this.object3D.visible = visible;
            three.render();
        }
    });
    return new BasePlane();
});