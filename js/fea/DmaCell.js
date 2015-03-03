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
    this.updateForScale(scale);

    this.drawForMode(dmaGlobals.appState.get("cellMode"));
}

DMACell.prototype.removePart = function(index){
    this.parts[index].destroy();
    this.parts[index] = null;
    var hasAnyParts = false;
    _.each(this.parts, function(part){
        if (part) hasAnyParts = true;
    });
    if (!hasAnyParts) this.lattice.removeCell(this);//if all parts are gone, remove cell
};

DMACell.prototype._setMeshPosition = function(mesh, position){
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    return mesh;
};

DMACell.prototype.drawForMode = function(mode){
    if (mode == "cell"){
        this._setCellMeshVisibility(true);
        _.each(this.parts, function(part){
            if (part) part.hide();
        });
    } else if (mode == "part"){
        this._setCellMeshVisibility(false);
        _.each(this.parts, function(part){
            if (part) part.show();
        });
    } else {
        console.warn("unrecognized draw mode for cell");
    }
};

DMACell.prototype.hide = function(){
    this._setCellMeshVisibility(false);
    _.each(this.parts, function(part){
        if (part) part.hide();
    });
};

DMACell.prototype.show = function(){
    this._setCellMeshVisibility(true);
};

DMACell.prototype._setCellMeshVisibility = function(visibility){
    if (!this.cellMesh) return;
    this.cellMesh.visible = visibility;
};

DMACell.prototype.updateForScale = function(scale){
    this.cellMesh.scale.set(scale, scale, scale);
    var position = this.getPosition();
    this._setMeshPosition(this.cellMesh, position);
    _.each(this.parts, function(part){
        if (part) part.updateForScale(scale, position);
     });
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
        dmaGlobals.three.sceneRemove(this.cellMesh, "cell");
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

    function DMASideOctaCell(indices, scale, lattice){
        DMACell.call(this, indices, scale, lattice);
    }
    DMASideOctaCell.prototype = Object.create(DMACell.prototype);

    DMASideOctaCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMATrianglePart(i, zIndex%2==1, this));
        }
        return parts;
    };

    DMASideOctaCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh;
        mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        if (zIndex%2!=0) mesh.rotation.set(0, 0, Math.PI);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "cell");
        return mesh;
    };

    DMASideOctaCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        position.z += dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMASideOctaCell = DMASideOctaCell;

    /////////////////////////////////////////////////TETRA CELL////////////////////////////////////

    var unitTetraCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitTetraCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitTetraCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
    unitTetraCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

    function DMATetraCell(indices, scale, lattice){
        DMACell.call(this, indices, scale, lattice, true);
    }
    DMATetraCell.prototype = Object.create(DMACell.prototype);

    DMATetraCell.prototype._initParts = function(){
        return [];
    };

    DMATetraCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh;
        mesh = THREE.SceneUtils.createMultiMaterialObject(unitTetraCellGeo, cellMaterials);
        if (zIndex%2 !=0) mesh.rotateX(Math.PI);
        if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);

        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        dmaGlobals.three.sceneAdd(mesh, "inverseCell");
        return mesh;
    };

    DMATetraCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        position.z += dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    DMATetraCell.prototype.getPosition = function(){//need for part relay
        return dmaGlobals.lattice.getInvCellPositionForIndex(this.indices);
    };

    self.DMATetraCell = DMATetraCell;

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
