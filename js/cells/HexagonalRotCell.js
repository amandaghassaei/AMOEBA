/**
 * Created by aghassaei on 8/17/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'hexCell'],
    function(_, THREE, three, lattice, appState, HexCell){

    var unitCellGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));

    function HexagonalCell(json, superCell){
        HexCell.call(this, json, superCell);
    }
    HexagonalCell.prototype = Object.create(HexCell.prototype);

    HexagonalCell.prototype._getGeometry = function(){
        return unitCellGeo;
    };

    HexagonalCell.prototype.aspectRatio = function(){
        return new THREE.Vector3(this.xScale()-1, this.yScale(), this.zScale()+Math.sqrt(3)/2);
    };

    return HexagonalCell;
});