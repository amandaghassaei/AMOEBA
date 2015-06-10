/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitCellGeo = new THREE.BoxGeometry(1,1,1);

    function CubeCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    CubeCell.prototype = Object.create(DMACell.prototype);

    CubeCell.prototype._getGeometry = function(){
        return unitCellGeo;
    };

    CubeCell.prototype._buildWireframe = function(mesh){//abstract mesh representation of cell
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    return CubeCell;
});