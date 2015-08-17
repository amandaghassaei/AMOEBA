/**
 * Created by aghassaei on 8/17/15.
 */

/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'baseplane'],
    function(_, Backbone, appState, lattice, three, THREE, BasePlane){

     return BasePlane.extend({

        _makeBasePlaneMesh: function(){

            var scale = lattice.xScale();
            var dimX = this.get("dimX")*scale;
            var dimY = this.get("dimY")*scale;

//            var geometry = new THREE.Geometry();
//
//            for ( var i = - dimX; i <= dimX+1; i += scale ) {
//                geometry.vertices.push( new THREE.Vector3(-dimX-scale/2, i-scale/2, 0.01));
//                geometry.vertices.push( new THREE.Vector3(dimX-scale/2, i-scale/2, 0.01));
//                geometry.vertices.push( new THREE.Vector3(i-scale/2, -dimX-scale/2, 0.01));
//                geometry.vertices.push( new THREE.Vector3(i-scale/2, dimX-scale/2, 0.01));
//
//            }
//
            var planeGeometry = new THREE.Geometry();
            planeGeometry.vertices.push( new THREE.Vector3(-dimX-scale/2, -dimX-scale/2, 0));
            planeGeometry.vertices.push( new THREE.Vector3(dimX+scale/2, -dimX-scale/2, 0));
            planeGeometry.vertices.push( new THREE.Vector3(-dimX-scale/2, dimX+scale/2, 0));
            planeGeometry.vertices.push( new THREE.Vector3(dimX+scale/2, dimX+scale/2, 0));
            planeGeometry.faces.push(new THREE.Face3(0, 1, 3));
            planeGeometry.faces.push(new THREE.Face3(0, 3, 2));
            planeGeometry.computeFaceNormals();

            var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.0}));
            return [mesh];
//            return [mesh, new THREE.Line(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}), THREE.LinePieces)];
        }
    });
});