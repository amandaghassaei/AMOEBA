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
        }

//        _renderZIndexChange: function(){
//            var zIndex = this.get("zIndex");
//            var zScale = lattice.zScale();
//            _.each(this.get("mesh"), function(mesh){
//                mesh.position.set(0, 0, zIndex*zScale);
//            });
//            three.render();
//        },
    });
});
