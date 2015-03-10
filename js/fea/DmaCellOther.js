/**
 * Created by aghassaei on 3/9/15.
 */


var cellMaterial = [new THREE.MeshNormalMaterial()];

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////TRUNCATED CUBE CLASS///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

(function(){

    var truncCubeRad = Math.sqrt(2)/2;
    var unitCellGeo = new THREE.Geometry();
    unitCellGeo.vertices = [
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
    unitCellGeo.faces = [
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
    unitCellGeo.computeFaceNormals();

    function DMATruncCubeCell(indices, scale){
        DMAInverseCell.call(this, indices, scale);
    }
    DMATruncCubeCell.prototype = Object.create(DMAInverseCell.prototype);

    DMATruncCubeCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = DMACell.prototype._buildCellMesh.call(this, unitCellGeo, cellMaterial);
        mesh.children.push(new THREE.EdgesHelper(mesh.children[0], 0x000000));
        return mesh;
    };

    self.DMATruncCubeCell = DMATruncCubeCell;

})();


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////CUBE CELL CLASS////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.BoxGeometry(1,1,1);

    function DMACubeCell(indices, scale){
        DMACell.call(this, indices, scale);
    }
    DMACubeCell.prototype = Object.create(DMACell.prototype);

    DMACubeCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = DMACell.prototype._buildCellMesh.call(this, unitCellGeo, cellMaterial);
        var wireframe = new THREE.BoxHelper(mesh.children[0]);
        wireframe.material.color.set(0x000000);
        mesh.children.push(wireframe);
        return mesh;
    };

    DMACubeCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        var position = this.getPosition();
        var scale = dmaGlobals.lattice.xScale();
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*scale/2;
        });
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMACubeCell = DMACubeCell;

})();
