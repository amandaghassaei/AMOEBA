/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'baseplane'],
    function(_, Backbone, appState, lattice, three, THREE, BasePlane){

    return BasePlane.extend({

        _makeBasePlaneMesh: function(){

            var xScale = lattice.xScale();
            var yScale = lattice.yScale();
            var dimX = this.get("dimX");
            var dimY = this.get("dimY");

            var geometry = new THREE.Geometry();

            for ( var i = - dimX; i <= dimX+1; i ++) {
                geometry.vertices.push( new THREE.Vector3(-dimX*xScale-xScale/2, i*yScale-yScale/2, 0.01));
                geometry.vertices.push( new THREE.Vector3((dimX+1)*xScale-xScale/2, i*yScale-yScale/2, 0.01));
                geometry.vertices.push( new THREE.Vector3(i*xScale-xScale/2, -dimX*yScale-yScale/2, 0.01));
                geometry.vertices.push( new THREE.Vector3(i*xScale-xScale/2, (dimX+1)*yScale-yScale/2, 0.01));
            }

            var planeGeometry = new THREE.Geometry();
            planeGeometry.vertices.push( new THREE.Vector3(-dimX*xScale-xScale/2, -dimX*yScale-yScale/2, 0));
            planeGeometry.vertices.push( new THREE.Vector3(dimX*xScale+xScale/2, -dimX*yScale-yScale/2, 0));
            planeGeometry.vertices.push( new THREE.Vector3(-dimX*xScale-xScale/2, dimX*yScale+yScale/2, 0));
            planeGeometry.vertices.push( new THREE.Vector3(dimX*xScale+xScale/2, dimX*yScale+yScale/2, 0));
            planeGeometry.faces.push(new THREE.Face3(0, 1, 3));
            planeGeometry.faces.push(new THREE.Face3(0, 3, 2));
            planeGeometry.computeFaceNormals();

            var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.0, side:THREE.DoubleSide}));
            return [mesh, new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}))];
        },

        _changePlaneType: function(){
            var type = this.get("planeType");
            if (type == "xy") this._setRotation(0, 0, 0);
            else if (type == "yz") this._setRotation(0, Math.PI/2, 0);
            else if (type == "xz") this._setRotation(-Math.PI/2, 0, 0);
            else {
                console.warn("invalid planeType given " + type);
            }
            var center = lattice.calcCenterIndex().round();
            this.set("zIndex", center[this.getNormalAxis()], {silent:true});
            this._setPosition(this.get("zIndex"));
            //this._setPosition(0);
            appState.showSketchLayer();
        },

        _changeOrientation: function(){
            this._setPosition(this.get("zIndex"));
            appState.showSketchLayer();
        },

        _zIndexChange: function(){
            var zIndex = this.get("zIndex");
            this._setPosition(zIndex);
            appState.changeSketchLayer(zIndex, this.get("orientationFlipped"));
        }
    });
});
