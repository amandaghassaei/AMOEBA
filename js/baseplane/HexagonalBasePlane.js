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

            var xScale = lattice.xScale();
            var yScale = lattice.yScale();
            var dimX = this.get("dimX");
            var dimY = this.get("dimY");

            var geometry = new THREE.Geometry();

            for (var i=-dimY;i<=dimY+1;i++) {
                for (var j=-dimX;j<=dimX;j+=1){
                    if (i%2 == 0){
                        geometry.vertices.push( new THREE.Vector3(j*xScale-xScale/2, i*yScale-1/2, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+0.5)*xScale-xScale/2, i*yScale-1, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+0.5)*xScale-xScale/2, i*yScale-1, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+1)*xScale-xScale/2, i*yScale-1/2, 0.01));
                        geometry.vertices.push( new THREE.Vector3(j*xScale-xScale/2, i*yScale-1/2, 0.01));
                        geometry.vertices.push( new THREE.Vector3(j*xScale-xScale/2, (i+1)*yScale-1, 0.01));
                    } else {
                        geometry.vertices.push( new THREE.Vector3(j*xScale-xScale/2, i*yScale-1, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+0.5)*xScale-xScale/2, i*yScale-1/2, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+0.5)*xScale-xScale/2, i*yScale-1/2, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+1)*xScale-xScale/2, i*yScale-1, 0.01))
                        geometry.vertices.push( new THREE.Vector3((j+0.5)*xScale-xScale/2, i*yScale-1/2, 0.01));
                        geometry.vertices.push( new THREE.Vector3((j+0.5)*xScale-xScale/2, (i+1)*yScale-1, 0.01));
                    }
                }
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
//            return [mesh];
            return [mesh, new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}))];
        }
    });
});