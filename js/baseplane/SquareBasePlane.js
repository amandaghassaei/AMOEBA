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

            var geometry = new THREE.Geometry();

            for ( var i = - dimX; i <= dimX; i += scale ) {
                geometry.vertices.push( new THREE.Vector3(-dimX, i, 0));
                geometry.vertices.push( new THREE.Vector3(dimX, i, 0));
                geometry.vertices.push( new THREE.Vector3(i, -dimX, 0));
                geometry.vertices.push( new THREE.Vector3(i, dimX, 0));

            }

            var planeGeometry = new THREE.Geometry();
            planeGeometry.vertices.push( new THREE.Vector3(-dimX, -dimX, 0));
            planeGeometry.vertices.push( new THREE.Vector3(dimX, -dimX, 0));
            planeGeometry.vertices.push( new THREE.Vector3(-dimX, dimX, 0));
            planeGeometry.vertices.push( new THREE.Vector3(dimX, dimX, 0));
            planeGeometry.faces.push(new THREE.Face3(0, 1, 3));
            planeGeometry.faces.push(new THREE.Face3(0, 3, 2));
            planeGeometry.computeFaceNormals();

            var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.0}));
            return [mesh, new THREE.Line(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}), THREE.LinePieces)];
        },

        _renderZIndexChange: function(){
            var zIndex = this.get("zIndex");
            var zScale = lattice.zScale();
            _.each(this.get("mesh"), function(mesh){
                mesh.position.set(0, 0, zIndex*zScale);
            });
            three.render();
        },

        calcHighlighterPosition: function(face, position){
            var index = lattice.getIndexForPosition(position);
            index.z = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
            var latticePosition = lattice.getPositionForIndex(index);
            latticePosition.z += lattice.zScale()/2;
            this.index = new THREE.Vector3(index.x, index.y, index.z);//todo no!!!
            return {index: index, direction: new THREE.Vector3(0,0,1), position:latticePosition};
        }
    });
});
