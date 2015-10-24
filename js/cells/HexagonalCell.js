/**
 * Created by aghassaei on 8/17/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.Geometry();
    unitGeo.vertices = [
        new THREE.Vector3(0, -1, 0.5),
        new THREE.Vector3(0.8660254037844386, -0.5, 0.5),
        new THREE.Vector3(0.8660254037844387, 0.5, 0.5),
        new THREE.Vector3(0, 1, 0.5),
        new THREE.Vector3(-0.8660254037844384, 0.5, 0.5),
        new THREE.Vector3(-0.8660254037844386, -0.5, 0.5),
        new THREE.Vector3(0, -1, 0.5),
        new THREE.Vector3(0, -1, -0.5),
        new THREE.Vector3(0.8660254037844386, -0.5, -0.5),
        new THREE.Vector3(0.8660254037844387, 0.5, -0.5),
        new THREE.Vector3(0, 1, -0.5),
        new THREE.Vector3(-0.8660254037844384, 0.5, -0.5),
        new THREE.Vector3(-0.8660254037844386, -0.5, -0.5),
        new THREE.Vector3(0, -1, -0.5),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, 0, -0.5)
    ];
    unitGeo.faces  = [
        new THREE.Face3(0, 7, 1),
        new THREE.Face3(7, 8, 1),
        new THREE.Face3(1, 8, 2),
        new THREE.Face3(8, 9, 2),
        new THREE.Face3(2, 9, 3),
        new THREE.Face3(9, 10, 3),
        new THREE.Face3(3, 10, 4),
        new THREE.Face3(10, 11, 4),
        new THREE.Face3(4, 11, 5),
        new THREE.Face3(11, 12, 5),
        new THREE.Face3(5, 12, 6),
        new THREE.Face3(12, 13, 6),
        new THREE.Face3(0, 1, 14),
        new THREE.Face3(1, 2, 14),
        new THREE.Face3(2, 3, 14),
        new THREE.Face3(3, 4, 14),
        new THREE.Face3(4, 5, 14),
        new THREE.Face3(5, 6, 14),
        new THREE.Face3(8, 7, 15),
        new THREE.Face3(9, 8, 15),
        new THREE.Face3(10, 9, 15),
        new THREE.Face3(11, 10, 15),
        new THREE.Face3(12, 11, 15),
        new THREE.Face3(13, 12, 15)
    ];
    unitGeo.computeFaceNormals();


    function HexagonalCell(json, superCell){
        DMACell.call(this, json, superCell);
    }
    HexagonalCell.prototype = Object.create(DMACell.prototype);

    HexagonalCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    HexagonalCell.prototype._buildWireframe = function(mesh){//abstract mesh representation of cell
        var wireframe = new THREE.EdgesHelper(mesh, 0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    return HexagonalCell;
});