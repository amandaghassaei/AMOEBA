/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

function DMACell(indices, scale) {

    this.indices = indices;
    this.cellMesh = this._buildCellMesh();
    if (!indices) return;//this is a way to get the cell mesh without really initing a cell

    this._doMeshTransformations(this.cellMesh);//some cell types require transformations, this may go away if i decide to do this in the geo instead
    dmaGlobals.three.sceneAdd(this.cellMesh, "cell");
    this.nodes = this._initNodes(this.cellMesh.children[0].geometry.vertices);
    this.beams = this._initBeams(this.nodes, this.cellMesh.children[0].geometry.faces);

    var cellMode = dmaGlobals.appState.get("cellMode");
    var beamMode = dmaGlobals.lattice.get("partType") == "beam";
    this.drawForMode(scale, cellMode, beamMode);

}

//todo this is a mess
DMACell.prototype.drawForMode = function(scale, cellMode, beamMode){
    this.updateForScale(scale, cellMode);
    this._setCellMeshVisibility(cellMode == "cell");
    if (!beamMode && cellMode == "part" && !this.parts) this.parts = this._initParts();
    _.each(this.parts, function(part){
        if (part) part.setVisibility(cellMode == "part" && !beamMode);
    });
    _.each(this.beams, function(beam){
        beam.setVisibility(beamMode && cellMode == "part");
    });
};

DMACell.prototype._buildCellMesh = function(material){//called from every subclass
    var unitCellGeo = this._getGeometry();
    if (!material) material = cellMaterials;
    var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, material);
    mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
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
        _.each(this.beams, function(beam){
            if (beam) beam.updateForScale(scale, position);
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
    return dmaGlobals.lattice.getPositionForIndex(this.indices);
};

DMACell.prototype._setCellMeshVisibility = function(visibility){
    this.cellMesh.visible = visibility;
};

DMACell.prototype.xScale = function(scale){
    return dmaGlobals.lattice.xScale(scale);
};

DMACell.prototype.yScale = function(scale){
    return dmaGlobals.lattice.yScale(scale);
};

DMACell.prototype.zScale = function(scale){
    return dmaGlobals.lattice.zScale(scale);
};


///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////META//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

DMACell.prototype._initParts = function(){
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
    this.parts = null;
    this.nodes = null;
    this.beams = null;
};

DMACell.prototype.toJSON = function(){
    var data = {
        indices:this.indices//todo get rid of this and calculate from min and max
    };
    if (this.parts) data.parts = this.parts;
    return data;
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

DMAFreeFormCell.prototype._calcPosition = function(){//todo this might not be necessary - put in lattice
    var position = {};
    var zScale = dmaGlobals.lattice.zScale();
    position.x = this.parentPos.x+this.parentDirection.x*zScale/2;
    position.y = this.parentPos.y+this.parentDirection.y*zScale/2;
    position.z = this.parentPos.z+this.parentDirection.z*zScale/2;
    return position;
};

DMAFreeFormCell.prototype.calcHighlighterPosition = function(face){
    var direction = face.normal.clone();
    direction.applyQuaternion(this.cellMesh.quaternion);
    var position = this.getPosition();
    position.add(direction.clone().multiplyScalar(this.zScale()/2));
    return {index: _.clone(this.indices), direction:direction, position:position};
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