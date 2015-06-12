/**
 * Created by aghassaei on 6/12/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', 'gikCell'],
    function(_, THREE, three, lattice, appState, DMASuperCell, GIKCell){

    CompositeCell = function(json, superCell){
        DMASuperCell.call(this, json, superCell);
    };
    CompositeCell.prototype = Object.create(DMASuperCell.prototype);

    CompositeCell.prototype._makeSubCellForIndex = function(json){
        return null;
    };



    CompositeCell.prototype._getGeometry = function(){
        return new THREE.BoxGeometry();
    };

    CompositeCell.prototype._buildWireframe = function(mesh){
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    return CompositeCell;
});