/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];
var cellMaterial = [new THREE.MeshNormalMaterial()];

function DMACell(indices, scale, inverse) {

    this.indices = indices;
    if (!inverse) inverse = false;
    this.isInverse = inverse;
    this.cellMesh = this._buildCellMesh(indices.z);

    var cellMode = dmaGlobals.lattice.get("cellMode");
    var inverseMode = dmaGlobals.lattice.get("inverseMode");

    this.drawForMode(scale, cellMode, inverseMode);
}

DMACell.prototype.drawForMode = function(scale, cellMode, inverseMode){
    this.updateForScale(scale, cellMode);
    this._setCellMeshVisibility(cellMode == "cell" && inverseMode==this.isInverse);//only show if in the correct inverseMode
    if (cellMode == "part" && !this.parts) this.parts = this._initParts(this.indices.z);
    _.each(this.parts, function(part){
        if (part) part.setVisibility(cellMode == "part");
    });
};

DMACell.prototype._superBuildCellMesh = function(zIndex, unitCellGeo, material){//abstract mesh representation of cell
    if (!material) material = cellMaterials;
    var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, material);
    this._doMeshTransformations(zIndex, mesh);
    mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
    if (this.isInverse) dmaGlobals.three.sceneAdd(mesh, "inverseCell");
    else dmaGlobals.three.sceneAdd(mesh, "cell");
    return mesh;
};

DMACell.prototype._doMeshTransformations = function(zIndex, mesh){};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////SCALE/POSITION////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

DMACell.prototype.updateForScale = function(scale, cellMode){
    //only update visible object to scale
    var position = this.getPosition();
    this.cellMesh.scale.set(scale, scale, scale);
    this._setMeshPosition(this.cellMesh, position);
    if (cellMode == "part"){
        _.each(this.parts, function(part){
            if (part) part.updateForScale(scale, position);
         });
    }
};

DMACell.prototype._setMeshPosition = function(mesh, position){
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
};

DMACell.prototype.getScale = function(){//need for part relay
    return dmaGlobals.lattice.get("scale");
};

DMACell.prototype.getPosition = function(){//need for part relay
    if (this.isInverse) return dmaGlobals.lattice.getInvCellPositionForIndex(this.indices);
    return dmaGlobals.lattice.getPositionForIndex(this.indices);
};

DMACell.prototype._setCellMeshVisibility = function(visibility){
    if (!this.cellMesh) return;
    this.cellMesh.visible = visibility;
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////DELETE////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

DMACell.prototype.removePart = function(index){
    this.parts[index].destroy();
    this.parts[index] = null;
    var hasAnyParts = false;//check if all parts have been deleted
    _.each(this.parts, function(part){
        if (part) hasAnyParts = true;
    });
    if (!hasAnyParts) dmaGlobals.lattice.removeCell(this);//if all parts are gone, remove cell
};

DMACell.prototype.destroy = function(){
    if (this.cellMesh) {
        var type = "cell";
        if (this.isInverse) type = "inverseCell"
        dmaGlobals.three.sceneRemove(this.cellMesh, type);
        this.cellMesh.myParent = null;
//            this.cellMesh.dispose();
//            geometry.dispose();
//            material.dispose();
        this.cellMesh = null;
    }
    _.each(this.parts, function(part){
        if (part) part.destroy();
    });
    this.indices = null;
    this.parts = null;
};





///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////OCTA FACE AND EDGE CLASS///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

(function () {

    var unitCellGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    function DMAFaceOctaCell(indices, scale){
        DMACell.call(this, indices, scale);
    }
    DMAFaceOctaCell.prototype = Object.create(DMACell.prototype);

    DMAFaceOctaCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMATrianglePart(i, zIndex%2==1, this));
        }
        return parts;
    };

    DMAFaceOctaCell.prototype._buildCellMesh = function(zIndex){
        return this._superBuildCellMesh(zIndex, unitCellGeo);
    };

    DMAFaceOctaCell.prototype._doMeshTransformations = function(zIndex, mesh){
        if (zIndex%2!=0) mesh.rotation.set(0, 0, Math.PI);
    };

    DMAFaceOctaCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        position.z += dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMAFaceOctaCell = DMAFaceOctaCell;


    function DMAEdgeOctaCell(indices, scale){
        DMAFaceOctaCell.call(this, indices, scale);
    }
    DMAEdgeOctaCell.prototype = Object.create(DMAFaceOctaCell.prototype);

    DMAEdgeOctaCell.prototype._doMeshTransformations = function(){};

    self.DMAEdgeOctaCell = DMAEdgeOctaCell;

})();

    /////////////////////////////////////////////////TETRA CELL////////////////////////////////////

(function () {

    var unitCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

    var unitCellGeoUpsideDown = unitCellGeo.clone();
    unitCellGeoUpsideDown.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

    function DMATetraFaceCell(indices, scale){
        DMACell.call(this, indices, scale, true);
    }
    DMATetraFaceCell.prototype = Object.create(DMACell.prototype);

    DMATetraFaceCell.prototype._initParts = function(){
        return [];
    };

    DMATetraFaceCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        if (zIndex%2 ==0) return this._superBuildCellMesh(zIndex, unitCellGeo);
        return this._superBuildCellMesh(zIndex, unitCellGeoUpsideDown);
    };

    DMATetraFaceCell.prototype._doMeshTransformations = function(zIndex, mesh){
        if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);
    };

    self.DMATetraFaceCell = DMATetraFaceCell;


    function DMATetraEdgeCell(indices, scale){
        DMATetraFaceCell.call(this, indices, scale, true);
    }
    DMATetraEdgeCell.prototype = Object.create(DMATetraFaceCell.prototype);

    DMATetraEdgeCell.prototype._doMeshTransformations = function(){};

    DMATetraEdgeCell.prototype.calcHighlighterPosition = function(face){

        //todo finish this
        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces
        var index = _.clone(this.indices);
        index.z = Math.floor(index.z/2);
        index.x = Math.floor(index.x/3);
        index.y = Math.floor(index.y/2);
        var position = dmaGlobals.lattice.getInvCellPositionForIndex(index);
        position.z += dmaGlobals.lattice.zScale();
        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    self.DMATetraEdgeCell = DMATetraEdgeCell;

})();

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////OCTA VERTEX CLASS//////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));

    function DMAVertexOctaCell(indices, scale){
        DMACell.call(this, indices, scale);
    }
    DMAVertexOctaCell.prototype = Object.create(DMACell.prototype);

    DMAVertexOctaCell.prototype._initParts = function(){
        return [];
    };

    DMAVertexOctaCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        return this._superBuildCellMesh(zIndex, unitCellGeo);
    };

    DMAVertexOctaCell.prototype.calcHighlighterPosition = function(face, point){

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        var direction = null;

        var xScale = dmaGlobals.lattice.xScale();
        if (point.x < position.x+xScale/4 && point.x > position.x-xScale/4){
            if (point.y > position.y-xScale/4 && point.y < position.y+xScale/4){
                if (face.normal.z > 0) {
                    direction = new THREE.Vector3(0,0,1);
                    position.z += dmaGlobals.lattice.zScale()/2;
                }
                else {
                    direction = new THREE.Vector3(0,0,-1);
                    position.z -= dmaGlobals.lattice.zScale()/2;
                }
            } else {
                if (point.y < position.y-xScale/4){
                    direction = new THREE.Vector3(0,-1,0);
                    position.y -= xScale/2;
                } else {
                    direction = new THREE.Vector3(0,1,0);
                    position.y += xScale/2;
                }
            }
        } else {
            if (point.x < position.x-xScale/4){
                direction = new THREE.Vector3(-1,0,0);
                position.x -= xScale/2;
            } else {
                direction = new THREE.Vector3(1,0,0);
                position.x += xScale/2;
            }
        }

        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    self.DMAVertexOctaCell = DMAVertexOctaCell;

})();

    /////////////////////////////////////////TRUNCATED CUBE////////////////////////////////////

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
        DMACell.call(this, indices, scale, true);
    }
    DMATruncCubeCell.prototype = Object.create(DMACell.prototype);

    DMATruncCubeCell.prototype._initParts = function(){
        return [];
    };

    DMATruncCubeCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = this._superBuildCellMesh(null, unitCellGeo, cellMaterial);
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

    DMACubeCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<4;i++){
            parts.push(new DMAPart(0, zIndex%2==1, this));
        }
        return parts;
    };

    DMACubeCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = this._superBuildCellMesh(null, unitCellGeo, cellMaterial);
        var wireframe = new THREE.BoxHelper(mesh.children[0]);
        wireframe.material.color.set(0x000000);
        mesh.children.push(wireframe);
        return mesh;
    };

    DMACubeCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        var scale = dmaGlobals.lattice.xScale();
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*scale/2;
        });
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMACubeCell = DMACubeCell;

})();
