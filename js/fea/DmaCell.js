/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

function DMACell(indices, scale, lattice, inverse) {

    this.indices = indices;
    if (!inverse) inverse = false;
    this.isInverse = inverse;
    this.lattice = lattice;//need ref back to lattice
    this.cellMesh = this._buildCellMesh(indices.z);
    this.parts = this._initParts(indices.z);

    var cellMode = dmaGlobals.appState.get("cellMode");
    var inverseMode = dmaGlobals.appState.get("inverseMode");

    this.drawForMode(scale, cellMode, inverseMode);
}

DMACell.prototype.removePart = function(index){
    this.parts[index].destroy();
    this.parts[index] = null;
    var hasAnyParts = false;//check if all parts have been deleted
    _.each(this.parts, function(part){
        if (part) hasAnyParts = true;
    });
    if (!hasAnyParts) this.lattice.removeCell(this);//if all parts are gone, remove cell
};

DMACell.prototype._setMeshPosition = function(mesh, position){
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
};

DMACell.prototype.drawForMode = function(scale, cellMode, inverseMode){
    this.updateForScale(scale, cellMode);
    this._setCellMeshVisibility(cellMode == "cell" && inverseMode==this.isInverse);//only show if in the correct inverseMode
    _.each(this.parts, function(part){
        if (part) part.setVisibility(cellMode == "part");
    });
};

DMACell.prototype._setCellMeshVisibility = function(visibility){
    if (!this.cellMesh) return;
    this.cellMesh.visible = visibility;
};

DMACell.prototype.updateForScale = function(scale, cellMode){
    //only update visible object to scale
    var position = this.getPosition();
    if (cellMode == "cell"){
        this.cellMesh.scale.set(scale, scale, scale);
        this._setMeshPosition(this.cellMesh, position);
    } else if (cellMode == "part"){
        _.each(this.parts, function(part){
            if (part) part.updateForScale(scale, position);
         });
    }
};

DMACell.prototype.getScale = function(){//need for part relay
    return this.lattice.get("scale");
};

DMACell.prototype.getPosition = function(){//need for part relay
    return dmaGlobals.lattice.getPositionForIndex(this.indices);
};

DMACell.prototype.getIndex = function(){
    return _.clone(this.indices);
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
    this.lattice = null;
    this.parts = null;
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////OCTA FACE AND EDGE CLASS///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

    function DMAFaceOctaCell(indices, scale, lattice){
        DMACell.call(this, indices, scale, lattice);
    }
    DMAFaceOctaCell.prototype = Object.create(DMACell.prototype);

    DMAFaceOctaCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMATrianglePart(i, zIndex%2==1, this));
        }
        return parts;
    };

    DMAFaceOctaCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh;
        mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        if (zIndex%2!=0) mesh.rotation.set(0, 0, Math.PI);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "cell");
        return mesh;
    };

    DMAFaceOctaCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        position.z += dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMAFaceOctaCell = DMAFaceOctaCell;


    function DMAEdgeOctaCell(indices, scale, lattice){
        DMAFaceOctaCell.call(this, indices, scale, lattice);
    }
    DMAEdgeOctaCell.prototype = Object.create(DMAFaceOctaCell.prototype);

    DMAEdgeOctaCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh;
        mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "cell");
        return mesh;
    };

    self.DMAEdgeOctaCell = DMAEdgeOctaCell;

    /////////////////////////////////////////////////TETRA CELL////////////////////////////////////

    var unitTetraCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitTetraCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitTetraCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
    unitTetraCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

    var unitTetraCellGeoUpsideDown = unitTetraCellGeo.clone();
    unitTetraCellGeoUpsideDown.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

    function DMATetraFaceCell(indices, scale, lattice){
        DMACell.call(this, indices, scale, lattice, true);
    }
    DMATetraFaceCell.prototype = Object.create(DMACell.prototype);

    DMATetraFaceCell.prototype._initParts = function(){
        return [];
    };

    DMATetraFaceCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh;
        if (zIndex%2 ==0) mesh = THREE.SceneUtils.createMultiMaterialObject(unitTetraCellGeo, cellMaterials);
        else mesh = THREE.SceneUtils.createMultiMaterialObject(unitTetraCellGeoUpsideDown, cellMaterials);
        if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);

        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "inverseCell");
        return mesh;
    };

    DMATetraFaceCell.prototype.calcHighlighterPosition = function(face){

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

    DMATetraFaceCell.prototype.getPosition = function(){//need for part relay
        return dmaGlobals.lattice.getInvCellPositionForIndex(this.indices);
    };

    self.DMATetraFaceCell = DMATetraFaceCell;

    function DMATetraEdgeCell(indices, scale, lattice){
        DMATetraFaceCell.call(this, indices, scale, lattice, true);
    }
    DMATetraEdgeCell.prototype = Object.create(DMATetraFaceCell.prototype);

    DMATetraEdgeCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh;
        if (zIndex%2 ==0) mesh = THREE.SceneUtils.createMultiMaterialObject(unitTetraCellGeo, cellMaterials);
        else mesh = THREE.SceneUtils.createMultiMaterialObject(unitTetraCellGeoUpsideDown, cellMaterials);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "inverseCell");
        return mesh;
    };

    self.DMATetraEdgeCell = DMATetraEdgeCell;

})();

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////OCTA VERTEX CLASS//////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];


    function DMAVertexOctaCell(indices, scale, lattice){
        DMACell.call(this, indices, scale, lattice);
    }
    DMAVertexOctaCell.prototype = Object.create(DMACell.prototype);

    DMAVertexOctaCell.prototype._initParts = function(zIndex){
        var parts  = [];
//        for (var i=0;i<3;i++){
//            parts.push(new DMAPart(i, zIndex%2==1, this));
//        }
        return parts;
    };

    DMAVertexOctaCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "cell");
        return mesh;
    };

    DMAVertexOctaCell.prototype.calcHighlighterPosition = function(face){

        var direction = new THREE.Vector3(0,0,1);
        if (face.normal.z<0) direction = null;

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        position.z += dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    self.DMAVertexOctaCell = DMAVertexOctaCell;

})();


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////CUBE CELL CLASS////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.BoxGeometry(1,1,1);

    var cellMaterials = [new THREE.MeshNormalMaterial()];//new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})


    function DMACubeCell(indices, scale, lattice){
        DMACell.call(this, indices, scale, lattice);
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
        var mesh = new THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        var wireframe = new THREE.BoxHelper(mesh.children[0]);
        wireframe.material.color.set(0x000000);
        mesh.children.push(wireframe);
        dmaGlobals.three.sceneAdd(mesh, "cell");
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
