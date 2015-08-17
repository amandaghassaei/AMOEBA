/**
 * Created by aghassaei on 8/17/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitCellGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

    function HexagonalCell(json, superCell){
        DMACell.call(this, json, superCell);
    }
    HexagonalCell.prototype = Object.create(DMACell.prototype);

    HexagonalCell.prototype._getGeometry = function(){
        return unitCellGeo;
    };

//    HexagonalCell.prototype._buildWireframe = function(mesh){//abstract mesh representation of cell
//        var wireframe = new THREE.BoxHelper(mesh);
//        wireframe.material.color.set(0x000000);
//        wireframe.matrixWorld = mesh.matrixWorld;
//        wireframe.matrixAutoUpdate = true;
//        return wireframe;
//    };


    HexagonalCell.prototype._buildWireframe = function(mesh){//abstract mesh representation of cell
        var wireframe = new THREE.EdgesHelper(mesh, 0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    HexagonalCell.prototype.calcHighlighterParams = function(face, point){//this works for rectalinear, override in subclasses
        var direction = this.applyAbsoluteRotation(face.normal.clone());//todo local orientation?
        if (direction.z < 0.9) return null;
    };

    return HexagonalCell;
});