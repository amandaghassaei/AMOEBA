/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

function DMACell(indices, scale, inverse) {

    this.indices = indices;
    if (!inverse) inverse = false;
    this.isInverse = inverse;
    this.cellMesh = this._buildCellMesh();
    this.nodes = this._initNodes(this.cellMesh.children[0].geometry.vertices);
    this.beams = this._initBeams(this.nodes, this.cellMesh.children[0].geometry.faces);

    var cellMode = dmaGlobals.lattice.get("cellMode");
    var inverseMode = dmaGlobals.lattice.get("inverseMode");
    var beamMode = dmaGlobals.lattice.get("partType") == "beam";
    this.drawForMode(scale, cellMode, inverseMode, beamMode);
}

//todo this is a mess
DMACell.prototype.drawForMode = function(scale, cellMode, inverseMode, beamMode){
    this.updateForScale(scale, cellMode);
    this._setCellMeshVisibility(cellMode == "cell" && inverseMode==this.isInverse);//only show if in the correct inverseMode
    if (!beamMode && cellMode == "part" && !this.parts) this.parts = this._initParts();
    _.each(this.parts, function(part){
        if (part) part.setVisibility(cellMode == "part" && !beamMode);
    });
    var self = this;
    _.each(this.beams, function(beam){
        beam.setVisibility(beamMode && cellMode == "part" && inverseMode==self.isInverse);
    });
};

DMACell.prototype._superBuildCellMesh = function(unitCellGeo, material){//called from every subclass
    if (!material) material = cellMaterials;
    var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, material);
    this._doMeshTransformations(mesh);//some cell types require transformations, this may go away if i decide to do this in the geo instead
    mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
    if (this.isInverse) dmaGlobals.three.sceneAdd(mesh, "inverseCell");
    else dmaGlobals.three.sceneAdd(mesh, "cell");
    return mesh;
};

DMACell.prototype._doMeshTransformations = function(mesh){};//by default, no mesh transformations

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////SCALE/POSITION////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

DMACell.prototype.updateForScale = function(scale, cellMode){
    //only update visible object to scale
    var position = this._calcPosition();
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

DMACell.prototype.getType = function(){
    return null;//only used in freeform layout
}

DMACell.prototype.getScale = function(){//need for part relay
    return dmaGlobals.lattice.get("scale");
};

DMACell.prototype.getPosition = function(){
    return this.cellMesh.position.clone();
};

DMACell.prototype.getOrientation = function(){
    return this.cellMesh.quaternion.clone();
};

DMACell.prototype.getEulerRotation = function(){
    return this.cellMesh.rotation.clone();
};

DMACell.prototype._calcPosition = function(){//need for part relay
    if (this.isInverse) return dmaGlobals.lattice.getInvCellPositionForIndex(this.indices);
    return dmaGlobals.lattice.getPositionForIndex(this.indices);
};

DMACell.prototype._setCellMeshVisibility = function(visibility){
    this.cellMesh.visible = visibility;
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////META//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

DMACell.prototype_initParts = function(){
    return [];//override in subclasses
};

DMACell.prototype._initNodes = function(vertices){
    var position = this.getPosition();
    var orientation = this.getOrientation();
    var nodes = [];
    var scale = this.getScale();
    for (var i=0;i<vertices.length;i++){
        var vertex = vertices[i].clone();
        vertex.applyQuaternion(orientation);
        vertex.add(position);
        vertex.multiplyScalar(scale);
        nodes.push(new DmaNode(vertex, i));
    }
    return nodes;
};

DMACell.prototype._initBeams = function(nodes, faces){
    var beams = [];
    var self = this;
    var addBeamFunc = function(index1, index2){
        var duplicate = false;
        _.each(beams, function(beam){
            var index = beam.getIndex();
            if (index[0] == index1 && index[1] == index2) duplicate = true;
        });
        if (duplicate) return;
        var diff = nodes[index1].getPosition();
        diff.sub(nodes[index2].getPosition());
        if (diff.length() > self.getScale()*1.01) return;
        if (index2>index1) {
            beams.push(new DmaBeam(nodes[index1], nodes[index2], self));
        }
    };
    for (var i=0;i<nodes.length;i++){
        _.each(faces, function(face){
            if (face.a == i) {
                addBeamFunc(i, face.b);
                addBeamFunc(i, face.c);
            } else if (face.b == i){
                addBeamFunc(i, face.a);
                addBeamFunc(i, face.c);
            } else if (face.c == i){
                addBeamFunc(i, face.a);
                addBeamFunc(i, face.b);
            }
        })
    }
    return beams;
};

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
        if (this.isInverse) type = "inverseCell";
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
    this.nodes = null;
    this.beams = null;
};

DMACell.prototype.toJSON = function(){
    if (!this.parts) this.parts = this._initParts();
    return {
        indices:this.indices,
        parts: this.parts
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FREEFORM SUPERCLASS////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAFreeFormCell(indices, scale, parentCellPos, parentCellQuat, direction, parentType){//no rigid lattice structure for cells
    this.parentPos = parentCellPos;
    this.parentQuaternion = parentCellQuat;
    this.parentDirection = direction;
    this.parentType = parentType;
    DMACell.call(this, indices, scale);
}
DMAFreeFormCell.prototype = Object.create(DMACell.prototype);

DMAFreeFormCell.prototype._calcPosition = function(){
    var position = {};
    var zScale = this.zScale();
    position.x = this.parentPos.x+this.parentDirection.x*zScale/2;
    position.y = this.parentPos.y+this.parentDirection.y*zScale/2;
    position.z = this.parentPos.z+this.parentDirection.z*zScale/2;
    return position;
};

DMAFreeFormCell.prototype.toJSON = function(){
    var json = DMACell.prototype.toJSON.call(this);
    _.extend(json, {
        parentPosition: this.parentPos,
        parentOrientation: this.parentQuaternion,
        direction: this.parentDirection,
        parentType: this.parentType,
        type: this.getType()
    });
    return json;
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////INVERSE SUPERCLASS/////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function DMAInverseCell(indices, scale){//no rigid lattice structure for cells
    DMACell.call(this, indices, scale, true);
}
DMAInverseCell.prototype = Object.create(DMACell.prototype);
