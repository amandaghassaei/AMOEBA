/**
 * Created by aghassaei on 3/9/15.
 */


var cellMaterial = [new THREE.MeshNormalMaterial()];


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
        var mesh = DMACell.prototype._buildCellMesh.call(this, cellMaterial);
        var wireframe = new THREE.BoxHelper(mesh.children[0]);
        wireframe.material.color.set(0x000000);
        mesh.children.push(wireframe);
        return mesh;
    };

    DMACubeCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        var position = this.getPosition();
        var scale = this.xScale();
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*scale/2;
        });
        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    DMACubeCell.prototype.getGeometry = function(){
        return unitCellGeo;
    };

    self.DMACubeCell = DMACubeCell;

})();


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
        DMACell.call(this, indices, scale);
    }
    DMATruncCubeCell.prototype = Object.create(DMACell.prototype);

    DMATruncCubeCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = DMACell.prototype._buildCellMesh.call(this, cellMaterial);
        mesh.children.push(new THREE.EdgesHelper(mesh.children[0], 0x000000));
        return mesh;
    };

    DMATruncCubeCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (!(Math.abs(direction.x)>0.9 || Math.abs(direction.y)>0.9 || Math.abs(direction.z)>0.9)) return {index: _.clone(this.indices)};

        var position = this.getPosition();
        var scale = this.zScale();
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*scale/2;
        });
        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    DMATruncCubeCell.prototype.getGeometry = function(){
        return unitCellGeo;
    };

    self.DMATruncCubeCell = DMATruncCubeCell;

})();

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////TRUNCATED OCTA CLASS///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

(function(){

    var truncOctaRad = Math.sqrt(2);
    var pyrRad = 1/Math.sqrt(2);
    var unitCellGeo = new THREE.Geometry();
    unitCellGeo.vertices = [
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
    unitCellGeo.faces = [
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
    unitCellGeo.computeFaceNormals();

    function DMATruncOctaCell(indices, scale){
        DMATruncCubeCell.call(this, indices, scale);
    }
    DMATruncOctaCell.prototype = Object.create(DMATruncCubeCell.prototype);

    DMATruncOctaCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = DMACell.prototype._buildCellMesh.call(this, cellMaterial);
        mesh.children.push(new THREE.EdgesHelper(mesh.children[0], 0x000000));
        return mesh;
    };

    DMATruncOctaCell.prototype.getGeometry = function(){
        return unitCellGeo;
    };

    self.DMATruncOctaCell = DMATruncOctaCell;

})();
