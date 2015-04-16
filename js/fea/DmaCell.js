/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

function DMACell(indices, scale, cellMode, partType) {

    this.indices = indices;

    this.cellMesh = this._buildCellMesh();
    this._doMeshTransformations(this.cellMesh);//some cell types require transformations

    dmaGlobals.three.sceneAdd(this.cellMesh,this._sceneType(indices));

    this.draw(scale, cellMode, partType);

    this.hideForStockSimulation = false;
}

DMACell.prototype._sceneType = function(indices){
    if (!indices || indices == null || indices === undefined) return null;
    return "cell";
};

DMACell.prototype.draw = function(scale, cellMode, partType){
    if (this.hideForStockSimulation) return;
    if (!scale) scale = dmaGlobals.lattice.get("scale");
    if (!cellMode) cellMode = dmaGlobals.appState.get("cellMode");
    if (!partType)  partType = dmaGlobals.lattice.get("partType");
    //var beamMode = partType == "beam";
    var beamMode = false;
    var partMode = cellMode == "part";

    //init parts/beams if needed
    if (partMode &&!beamMode && !this.parts) this.parts = this._initParts();
    if (beamMode && !this.beams) {
        this.nodes = this._initNodes(this.cellMesh.children[0].geometry.vertices);
        this.beams = this._initBeams(this.nodes, this.cellMesh.children[0].geometry.faces);
    }

    //update scale
    this.updateForScale(scale, cellMode, partType);

    //set visibility
    this._setCellMeshVisibility(!partMode);
    _.each(this.parts, function(part){
        if (part) part.setVisibility(partMode && !beamMode);
    });
    _.each(this.beams, function(beam){
        beam.setVisibility(beamMode && partMode);
    });
};

DMACell.prototype.hide = function(){//only used in the context of stock simulation
    this._setCellMeshVisibility(false);
    _.each(this.parts, function(part){
        if (part) part.setVisibility(false);
    });
    _.each(this.beams, function(beam){
        beam.setVisibility(false);
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////SCALE/POSITION////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

DMACell.prototype.updateForScale = function(scale, cellMode, partType){
    if (!scale) scale = dmaGlobals.lattice.get("scale");
    var position = this._calcPosition();
    this._setMeshPosition(this.cellMesh, position);
    this.cellMesh.scale.set(scale, scale, scale);//must do this so highlighting works properly in part mode

    //only update visible object to scale
    if (!cellMode) cellMode = dmaGlobals.appState.get("cellMode");
    if (!partType)  partType = dmaGlobals.lattice.get("partType");
    if (cellMode == "part"){
        if (partType == "beam"){
            _.each(this.beams, function(beam){
                if (beam) beam.updateForScale(scale, position);//todo this is not working quite right yet
            });
        } else {
            _.each(this.parts, function(part){
                if (part) part.updateForScale(scale, position);
            });
        }
    }
};

DMACell.prototype._setMeshPosition = function(mesh, position){
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
};

DMACell.prototype.moveTo = function(position, axis){//used for stock simulations
    this.cellMesh.position[axis] = position;
    if (dmaGlobals.appState.get("cellMode") == "part"){
        _.each(this.parts, function(part){
            if (part) part.moveTo(position, axis);
        });
    }
};

DMACell.prototype.getType = function(){
    return null;//only used in freeform layout
};

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
    if (this.indices) return dmaGlobals.lattice.getPositionForIndex(this.indices);
    return this.cellMesh.position;//used for cam simulation
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

DMACell.prototype._buildCellMesh = function(material){//called from every subclass
    var unitCellGeo = this._getGeometry();
    if (!material) material = cellMaterials;
    var mesh = THREE.SceneUtils.createMultiMaterialObject(unitCellGeo, material);
    mesh.myParent = this;//we need a reference to this instance from the mesh for intersection selection stuff
    return mesh;
};

DMACell.prototype._doMeshTransformations = function(mesh){};//by default, no mesh transformations

DMACell.prototype._initParts = function(){
    return [];//override in subclasses
};

DMACell.prototype.changePartType = function(){//override in subclasses
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

DMACell.prototype.destroyParts = function(){
    _.each(this.parts, function(part){
        if (part) part.destroy();
    });
    this.parts = null;
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
        //vertex.multiplyScalar(scale);
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

DMACell.prototype.destroy = function(){
    if (this.cellMesh) {
        dmaGlobals.three.sceneRemove(this.cellMesh, this._sceneType(this.indices));
        this.cellMesh.myParent = null;
//            this.cellMesh.dispose();
//            geometry.dispose();
//            material.dispose();
        this.cellMesh = null;
    }
    this.destroyParts();
    this.indices = null;
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