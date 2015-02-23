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

    window.three.sceneAdd(this.cellMesh, "cell");
    this.drawForMode(window.appState.get("cellMode"));
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
    var position = this._calcPosition(scale, this.indices);
    this._setMeshPosition(this.cellMesh, position);
    _.each(this.parts, function(part){
        if (part) part.updateForScale(scale, position);
     });
};

DMACell.prototype.getScale = function(){//need for part relay
    return this.lattice.get("scale");
};

DMACell.prototype.getPosition = function(){//need for part relay
    return this._calcPosition(this.getScale(), this.indices);
};

DMACell.prototype.getIndex = function(){
    return _.clone(this.indices);
};

DMACell.prototype.canRemove = function(){
    return true;//tells highlighter that a cell is something that can be deleted
};

DMACell.prototype.destroy = function(){
    if (this.cellMesh) {
        window.three.sceneRemove(this.cellMesh, "cell");
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

    var unitOctHeight = 2/Math.sqrt(6);

    var unitCellGeo1 = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,unitOctHeight/2));

    var unitCellGeo2 = unitCellGeo1.clone();

    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];


    function DMASideOctaCell(mode, indices, scale, lattice){
        DMACell.call(this, mode, indices, scale, lattice);
    }
    DMASideOctaCell.prototype = Object.create(DMACell.prototype);

    DMASideOctaCell.prototype._calcPosition = function(scale, indices){
        var latticeScale = this.lattice.getScale();
        var position = {};
        var octHeight = 2*scale/Math.sqrt(6);
        var triHeight = latticeScale/2*Math.sqrt(3);
        position.x = indices.x*latticeScale;
        position.y = indices.y*triHeight-latticeScale/Math.sqrt(3);
        position.z = indices.z*octHeight;
        if (Math.abs(indices.y%2) == 1) position.x -= latticeScale/2;
        return position;
    };

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

    DMASideOctaCell.prototype.getHighlighterVertices = function(face){
        if (face.normal.z<0.99) return null;//only highlight horizontal faces

        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var mesh = this.cellMesh.children[0];
        var vertices = mesh.geometry.vertices;
        var newVertices = [vertices[face.a].clone(), vertices[face.b].clone(), vertices[face.c].clone()];
        var scale = this.cellMesh.scale.x;
        var position = (new THREE.Vector3()).setFromMatrixPosition(mesh.matrixWorld);
        _.each(newVertices, function(vertex){//apply scale
            vertex.multiplyScalar(scale);
            vertex.add(position);
        });
        return newVertices;
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

    DMAVertexOctaCell.prototype._calcPosition = function(scale, indices){
        var position = {};
//        var octHeight = 2*scale/Math.sqrt(6);
//        var triHeight = scale/2*Math.sqrt(3);
//        position.x = indices.x*scale;
//        position.y = indices.y*triHeight;
//        position.z = indices.z*octHeight;
//        if (Math.abs(indices.y%2) == 1) position.x -= scale/2;
//        if (Math.abs(indices.z%2) == 1) position.y -= triHeight*4/3;
        return position;
    };

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
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(1/2,1/2,1/2));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];


    function DMACubeCell(mode, indices, scale, lattice){
        DMACell.call(this, mode, indices, scale, lattice);
    }
    DMACubeCell.prototype = Object.create(DMACell.prototype);

    DMACubeCell.prototype._calcPosition = function(scale, indices){
        var position = _.clone(indices);
        _.each(_.keys(position), function(key){
            position[key] *= scale;
        });
        return position;
    };

    DMACubeCell.prototype._initParts = function(zIndex){
        var parts  = [];
        for (var i=0;i<4;i++){
            parts.push(new DMAPart(0, zIndex%2==1, this));
        }
        return parts;
    };

    DMACubeCell.prototype._buildCellMesh = function(zIndex){//abstract mesh representation of cell
        var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, cellMaterials);
        mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
        return mesh;
    };

    DMACubeCell.prototype.getHighlighterVertices = function(face){
//        if (face.normal.z<0.99) return null;//only highlight horizontal faces

        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var mesh = this.cellMesh.children[0];
        var vertices = mesh.geometry.vertices;
        var newVertices = [vertices[face.a].clone(), vertices[face.b].clone(), vertices[face.c].clone(), new THREE.Vector3(0,0,0)];
        var scale = this.cellMesh.scale.x;
        var position = (new THREE.Vector3()).setFromMatrixPosition(mesh.matrixWorld);
        _.each(newVertices, function(vertex){//apply scale
            vertex.multiplyScalar(scale);
            vertex.add(position);
        });
        return newVertices;
    }

    self.DMACubeCell = DMACubeCell;

})();
