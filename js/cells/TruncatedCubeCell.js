/**
 * Created by aghassaei on 5/26/15.
 */


define(['cell'], function(DMACell){

    var truncCubeRad = Math.sqrt(2)/2;
    var unitGeo = new THREE.Geometry();
    unitGeo.vertices = [
        new THREE.Vector3(truncCubeRad, 0, truncCubeRad),
        new THREE.Vector3(0, truncCubeRad, truncCubeRad),
        new THREE.Vector3(-truncCubeRad, 0, truncCubeRad),
        new THREE.Vector3(0, -truncCubeRad, truncCubeRad),

        new THREE.Vector3(truncCubeRad, truncCubeRad, 0),
        new THREE.Vector3(-truncCubeRad, truncCubeRad, 0),
        new THREE.Vector3(-truncCubeRad, -truncCubeRad, 0),
        new THREE.Vector3(truncCubeRad, -truncCubeRad, 0),

        new THREE.Vector3(truncCubeRad, 0, -truncCubeRad),
        new THREE.Vector3(0, truncCubeRad, -truncCubeRad),
        new THREE.Vector3(-truncCubeRad, 0, -truncCubeRad),
        new THREE.Vector3(0, -truncCubeRad, -truncCubeRad)
    ];
    unitGeo.faces = [
        new THREE.Face3(1,0,4),
        new THREE.Face3(2,1,5),
        new THREE.Face3(3,2,6),
        new THREE.Face3(0,3,7),

        new THREE.Face3(8,9,4),
        new THREE.Face3(9,10,5),
        new THREE.Face3(10,11,6),
        new THREE.Face3(11,8,7),

        new THREE.Face3(0,1,3),
        new THREE.Face3(2,3,1),
        new THREE.Face3(8,11,9),
        new THREE.Face3(11,10,9),
        new THREE.Face3(0,8,4),
        new THREE.Face3(0,7,8),
        new THREE.Face3(1,9,5),
        new THREE.Face3(1,4,9),
        new THREE.Face3(2,10,6),
        new THREE.Face3(2,5,10),
        new THREE.Face3(3,11,7),
        new THREE.Face3(3,6,11)
    ];
    unitGeo.computeFaceNormals();

    function TruncatedCubeCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    TruncatedCubeCell.prototype = Object.create(DMACell.prototype);

    TruncatedCubeCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    TruncatedCubeCell.prototype._buildWireframe = function(mesh){//abstract mesh representation of cell
        var wireframe = new THREE.EdgesHelper(mesh, 0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    TruncatedCubeCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (!(Math.abs(direction.x)>0.9 || Math.abs(direction.y)>0.9 || Math.abs(direction.z)>0.9)) return {index: _.clone(this.index)};

        var position = this.getPosition();
        var scale = this.zScale();
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*scale/2;
        });
        return {index: _.clone(this.index), direction:direction, position:position};
    };

    return TruncatedCubeCell;
});