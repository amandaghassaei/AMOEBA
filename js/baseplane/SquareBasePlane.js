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

            var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.0}));
            return [mesh, new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}))];
        },

        _changePlaneType: function(){
            var type = this.get("planeType");
            if (type == "xy") this.object3D.rotation.set(0, 0, 0);
            else if (type == "yz") this.object3D.rotation.set(0, Math.PI/2, 0);
            else if (type == "xz") this.object3D.rotation.set(-Math.PI/2, 0, 0);
            else {
                console.warn("invalid planeType given " + type);
            }
            this.set("zIndex", 0, {silent:true});
            this._setPosition(this.object3D, 0);
            three.render();
        },

        _renderZIndexChange: function(){
            var zIndex = this.get("zIndex");
            var scale = lattice.getAspectRatio()[this._normalAxis()];
            this._setPosition(this.object3D, zIndex*scale);
            three.render();
        }
    });
});
