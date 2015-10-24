/**
 * Created by aghassaei on 8/17/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'hexCell'],
    function(_, THREE, three, lattice, appState, HexCell){

    var unitGeo = new THREE.Geometry();
    unitGeo.vertices = [
        new THREE.Vector3(1, 0.5, 0),
        new THREE.Vector3(0.5, 0.5, -0.8660254037844386),
        new THREE.Vector3(-0.5, 0.5, -0.8660254037844387),
        new THREE.Vector3(-1, 0.5, 0),
        new THREE.Vector3(-0.5, 0.5, 0.8660254037844384),
        new THREE.Vector3(0.5, 0.5, 0.8660254037844386),
        new THREE.Vector3(1, 0.5, 0),
        new THREE.Vector3(1, -0.5, 0),
        new THREE.Vector3(0.5, -0.5, -0.8660254037844386),
        new THREE.Vector3(-0.5, -0.5, -0.8660254037844387),
        new THREE.Vector3(-1, -0.5, 0),
        new THREE.Vector3(-0.5, -0.5, 0.8660254037844384),
        new THREE.Vector3(0.5, -0.5, 0.8660254037844386),
        new THREE.Vector3(1, -0.5, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0, -0.5, 0)
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
        HexCell.call(this, json, superCell);
    }
    HexagonalCell.prototype = Object.create(HexCell.prototype);

    HexagonalCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    HexagonalCell.prototype.aspectRatio = function(){
        return new THREE.Vector3(this.xScale()-1, this.yScale(), this.zScale()+Math.sqrt(3)/2);
    };

    return HexagonalCell;
});