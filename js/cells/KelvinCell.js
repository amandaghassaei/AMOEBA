/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'truncatedCubeCell'],
    function(_, THREE, three, lattice, appState, TruncatedCubeCell){

    var truncOctaRad = Math.sqrt(2);
    var pyrRad = 1/Math.sqrt(2);
    var unitGeo = new THREE.Geometry();
    unitGeo.vertices = [
        new THREE.Vector3(pyrRad, 0, truncOctaRad),
        new THREE.Vector3(0, pyrRad, truncOctaRad),
        new THREE.Vector3(-pyrRad, 0, truncOctaRad),
        new THREE.Vector3(0, -pyrRad, truncOctaRad),

        new THREE.Vector3(pyrRad, 0, -truncOctaRad),
        new THREE.Vector3(0, pyrRad, -truncOctaRad),
        new THREE.Vector3(-pyrRad, 0, -truncOctaRad),
        new THREE.Vector3(0, -pyrRad, -truncOctaRad),

        new THREE.Vector3(truncOctaRad, 0, pyrRad),
        new THREE.Vector3(truncOctaRad, pyrRad, 0),
        new THREE.Vector3(truncOctaRad, 0, -pyrRad),
        new THREE.Vector3(truncOctaRad, -pyrRad, 0),

        new THREE.Vector3(-truncOctaRad, 0, pyrRad),
        new THREE.Vector3(-truncOctaRad, pyrRad, 0),
        new THREE.Vector3(-truncOctaRad, 0, -pyrRad),
        new THREE.Vector3(-truncOctaRad, -pyrRad, 0),

        new THREE.Vector3(pyrRad, truncOctaRad, 0),
        new THREE.Vector3(0, truncOctaRad, pyrRad),
        new THREE.Vector3(-pyrRad, truncOctaRad, 0),
        new THREE.Vector3(0, truncOctaRad, -pyrRad),

        new THREE.Vector3(pyrRad, -truncOctaRad, 0),
        new THREE.Vector3(0, -truncOctaRad, pyrRad),
        new THREE.Vector3(-pyrRad, -truncOctaRad, 0),
        new THREE.Vector3(0, -truncOctaRad, -pyrRad)
    ];
    unitGeo.faces = [
        new THREE.Face3(0,1,3),
        new THREE.Face3(2,3,1),
        new THREE.Face3(4,7,5),
        new THREE.Face3(7,6,5),

        new THREE.Face3(8,11,9),
        new THREE.Face3(10,9,11),
        new THREE.Face3(12,13,15),
        new THREE.Face3(15,13,14),

        new THREE.Face3(16,19,17),
        new THREE.Face3(18,17,19),
        new THREE.Face3(20,21,23),
        new THREE.Face3(23,21,22),

        new THREE.Face3(0, 8, 1),
        new THREE.Face3(16, 8, 9),
        new THREE.Face3(16, 17, 1),
        new THREE.Face3(1, 8, 16),

        new THREE.Face3(1, 12, 2),
        new THREE.Face3(18, 13, 12),
        new THREE.Face3(17, 18, 1),
        new THREE.Face3(1, 18, 12),

        new THREE.Face3(3, 8, 0),
        new THREE.Face3(20, 11, 8),
        new THREE.Face3(20, 3, 21),
        new THREE.Face3(20, 8, 3),

        new THREE.Face3(3, 2, 12),
        new THREE.Face3(12, 15, 22),
        new THREE.Face3(22, 21, 3),
        new THREE.Face3(22, 3, 12),

        new THREE.Face3(4, 5, 10),
        new THREE.Face3(16, 9, 10),
        new THREE.Face3(16, 5, 19),
        new THREE.Face3(5, 16, 10),

        new THREE.Face3(5, 6, 14),
        new THREE.Face3(18, 14, 13),
        new THREE.Face3(19, 5, 18),
        new THREE.Face3(18, 5, 14),

        new THREE.Face3(7, 4, 10),
        new THREE.Face3(20, 10, 11),
        new THREE.Face3(20, 23, 7),
        new THREE.Face3(20, 7, 10),

        new THREE.Face3(7, 14, 6),
        new THREE.Face3(14, 22, 15),
        new THREE.Face3(22, 7, 23),
        new THREE.Face3(22, 14, 7),
    ];
    unitGeo.computeFaceNormals();

    function KelvinCell(index, superCell){
        TruncatedCubeCell.call(this, index, superCell);
    }
    KelvinCell.prototype = Object.create(TruncatedCubeCell.prototype);
    
    KelvinCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    return KelvinCell;
});