/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

function DMACell(indices, scale, lattice) {

    this.indices = indices;
    this.lattice = lattice;//need ref back to lattice
    this.cellMesh = this._buildCellMesh(indices.z);
    this.parts = this._initParts(indices.z);
    this.updateForScale(scale);

    dmaGlobals.three.sceneAdd(this.cellMesh, "cell");
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

    var unitCellGeo1 = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));
//    var unitOctHeight = 2/Math.sqrt(6);
//    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,unitOctHeight/2));

    var unitCellGeo2 = unitCellGeo1.clone();

    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

    function DMASideOctaCell(mode, indices, scale, lattice){
        DMACell.call(this, mode, indices, scale, lattice);
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
        if (zIndex%2==0){
            mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo1, cellMaterials);
        } else {
            mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo2, cellMaterials);
        }
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        return mesh;
    };

    DMASideOctaCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

//        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
//        var mesh = this.cellMesh.children[0];
//        var vertices = mesh.geometry.vertices;
//        var newVertices = [vertices[face.a].clone(), vertices[face.b].clone(), vertices[face.c].clone()];
//        var scale = this.cellMesh.scale.x;
//        var position = (new THREE.Vector3()).setFromMatrixPosition(mesh.matrixWorld);
//        _.each(newVertices, function(vertex){//apply scale
//            vertex.multiplyScalar(scale);
//            vertex.add(position);
//        });

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        position.z += dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMASideOctaCell = DMASideOctaCell;

})();

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////OCTA VERTEX CLASS//////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];


    function DMAVertexOctaCell(mode, indices, scale, lattice){
        DMACell.call(this, mode, indices, scale, lattice);
    }
    DMAVertexOctaCell.prototype = Object.create(DMACell.prototype);

    DMAVertexOctaCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMAPart(i, zIndex%2==1, this));
        }
        return parts;
    };

    DMAVertexOctaCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        return mesh;
    };

    self.DMAVertexOctaCell = DMAVertexOctaCell;

})();


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////CUBE CELL CLASS////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


(function () {

    var unitCellGeo = new THREE.BoxGeometry(1,1,1);

    var cellMaterial = new THREE.MeshNormalMaterial();


    function DMACubeCell(mode, indices, scale, lattice){
        DMACell.call(this, mode, indices, scale, lattice);
    }
    DMACubeCell.prototype = Object.create(DMACell.prototype);

    DMACubeCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<4;i++){
            parts.push(new DMAPart(0, zIndex%2==1, this));
        }
        return parts;
    };

    DMACubeCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh = new THREE.Mesh(unitCellGeo, cellMaterial);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
//        mesh.add(wireframe);
        return mesh;
    };

    DMACubeCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
//        if (direction.z<0.99) direction = null;//only highlight horizontal faces

        var position = dmaGlobals.lattice.getPositionForIndex(this.indices);
        var scale = dmaGlobals.lattice.xScale();
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*scale/2;
        });
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMACubeCell = DMACubeCell;

})();
