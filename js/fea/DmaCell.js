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
    this.cellMesh = this._buildCellMesh();
    this.nodes = this._initNodes(_.clone(this.cellMesh.children[0].geometry.vertices));
    this.beams = this._initBeams(this.nodes, this.cellMesh.children[0].geometry.faces);

    var cellMode = dmaGlobals.lattice.get("cellMode");
    var inverseMode = dmaGlobals.lattice.get("inverseMode");
    this.drawForMode(scale, cellMode, inverseMode);
}

DMACell.prototype.drawForMode = function(scale, cellMode, inverseMode){
    this.updateForScale(scale, cellMode);
    this._setCellMeshVisibility(cellMode == "cell" && inverseMode==this.isInverse);//only show if in the correct inverseMode
    if (cellMode == "part" && !this.parts) this.parts = this._initParts();
    _.each(this.parts, function(part){
        if (part) part.setVisibility(cellMode == "part");
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

DMACell.prototype._doMeshTransformations = function(mesh){};//by defualt, no mesh transformations

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
}

DMACell.prototype._initNodes = function(vertices){
    var position = this.getPosition();
    var orientation = this.getOrientation();
    var nodes = [];
    for (var i=0;i<vertices.length;i++){
        var vertex = vertices[i];
        vertex.applyQuaternion(orientation);
        vertex.add(position);
        nodes.push(new DmaNode(vertex, i));
    }
    return nodes;
};

DMACell.prototype._initBeams = function(){
    return [];
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

    DMAFaceOctaCell.prototype._initParts = function(){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMATrianglePart(i, this));
        }
        return parts;
    };

    DMAFaceOctaCell.prototype._initBeams = function(nodes, faces){
        var beams = [];
        var addBeamFunc = function(index1, index2){
            var duplicate = false;
            _.each(beams, function(beam){
                var index = beam.getIndex();
                if (index[0] == index1 && index[1] == index2) duplicate = true;
            });
            if (duplicate) return;
            if (index2>index1) {
                beams.push(new DmaBeam(nodes[index1], nodes[index2]));
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

    DMAFaceOctaCell.prototype._buildCellMesh = function(){
        return this._superBuildCellMesh(unitCellGeo);
    };

    DMAFaceOctaCell.prototype._doMeshTransformations = function(mesh){
        if (this.indices.z%2!=0) mesh.rotation.set(0, 0, Math.PI);
    };

    DMAFaceOctaCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal;
        if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

        var position = this.getPosition();
        position.z += face.normal.z*dmaGlobals.lattice.zScale()/2;
        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    self.DMAFaceOctaCell = DMAFaceOctaCell;


    function DMAEdgeOctaCell(indices, scale){
        DMAFaceOctaCell.call(this, indices, scale);
    }
    DMAEdgeOctaCell.prototype = Object.create(DMAFaceOctaCell.prototype);

    DMAEdgeOctaCell.prototype._doMeshTransformations = function(){};

    self.DMAEdgeOctaCell = DMAEdgeOctaCell;


    function DMAFreeFormOctaCell(indices, scale, parentCellPos, parentCellQuat, direction, parentType){
        this.parentPos = parentCellPos;
        this.parentQuaternion = parentCellQuat;
        this.parentDirection = direction;
        this.parentType = parentType;
        DMAFaceOctaCell.call(this, indices, scale);
    }
    DMAFreeFormOctaCell.prototype = Object.create(DMAFaceOctaCell.prototype);

    DMAFreeFormOctaCell.prototype._doMeshTransformations = function(mesh){

        var direction = this.parentDirection.clone();
        var zAxis = new THREE.Vector3(0,0,1);
        zAxis.applyQuaternion(this.parentQuaternion);
        var quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, direction);
        quaternion.multiply(this.parentQuaternion);

        if ((this.parentType == "octa" && direction.sub(zAxis).length() < 0.1) || this.parentType == "tetra"){
            var zRot = new THREE.Quaternion().setFromAxisAngle(this.parentDirection, Math.PI);
            zRot.multiply(quaternion);
            quaternion = zRot;
        }

        var eulerRot = new THREE.Euler().setFromQuaternion(quaternion);
        mesh.rotation.set(eulerRot.x, eulerRot.y, eulerRot.z);
    };

    DMAFreeFormOctaCell.prototype.getType = function(){
        return "octa";
    };

    DMAFreeFormOctaCell.prototype.calcHighlighterPosition = function(face){
        var direction = face.normal.clone();
        direction.applyQuaternion(this.cellMesh.quaternion);

        var position = this.getPosition();
        var zScale = this.zScale();
        position.x += direction.x*zScale/2;
        position.y += direction.y*zScale/2;
        position.z += direction.z*zScale/2;

        return {index: _.clone(this.indices), direction:direction, position:position};
    }

    DMAFreeFormOctaCell.prototype._calcPosition = function(){
        var position = {};
        var zScale = this.zScale();
        position.x = this.parentPos.x+this.parentDirection.x*zScale/2;
        position.y = this.parentPos.y+this.parentDirection.y*zScale/2;
        position.z = this.parentPos.z+this.parentDirection.z*zScale/2;
        return position;
    };

    DMAFreeFormOctaCell.prototype.zScale = function(scale){
        if (!scale) scale = dmaGlobals.lattice.get("scale");
        return 2*scale/Math.sqrt(6);
    };

    DMAFreeFormOctaCell.prototype.toJSON = function(){
        var json = DMACell.prototype.toJSON.call(this);
        _.extend(json, {
            parentPosition: this.parentPos,
            parentOrientation: this.parentQuaternion,
            direction: this.parentDirection,
            parentType: this.parentType,
            type: "octa"
        });
        return json;
    }

    self.DMAFreeFormOctaCell = DMAFreeFormOctaCell;

})();

    /////////////////////////////////////////////////TETRA CELL////////////////////////////////////

(function () {

    var unitCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
    unitCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

    var unitCellGeoUpsideDown = unitCellGeo.clone();
    unitCellGeoUpsideDown.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

    function DMATetraFaceCell(indices, scale, inverse){
        DMACell.call(this, indices, scale, inverse);
    }
    DMATetraFaceCell.prototype = Object.create(DMACell.prototype);

    DMATetraFaceCell.prototype._initParts = function(){
        return [];
    };

    DMATetraFaceCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var zIndex = this.indices.z;
        if (zIndex%2 ==0) return this._superBuildCellMesh(unitCellGeo);
        return this._superBuildCellMesh(unitCellGeoUpsideDown);
    };

    DMATetraFaceCell.prototype._doMeshTransformations = function(mesh){
        var zIndex = this.indices.z;
        if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);
    };

    self.DMATetraFaceCell = DMATetraFaceCell;


    var unitCellGeo2 = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));

    function DMAFreeFormTetraCell(indices, scale, parentCellPos, parentCellQuat, direction, parentType){
        this.parentPos = parentCellPos;
        this.parentQuaternion = parentCellQuat;
        this.parentDirection = direction;
        this.parentType = parentType;
        DMATetraFaceCell.call(this, indices, scale);
    }
    DMAFreeFormTetraCell.prototype = Object.create(DMATetraFaceCell.prototype);

    DMAFreeFormTetraCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        return this._superBuildCellMesh(unitCellGeo2);
    };

    DMAFreeFormTetraCell.prototype.getType = function(){
        return "tetra";
    };

    DMAFreeFormTetraCell.prototype._doMeshTransformations = function(mesh){
        var direction = this.parentDirection.clone();
        var zAxis = new THREE.Vector3(0,0,1);
        zAxis.applyQuaternion(this.parentQuaternion);
        var quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, direction);
        quaternion.multiply(this.parentQuaternion);

        if (this.parentType == "octa" && direction.sub(zAxis).length() > 0.1){//only do this if connecting to octa
            var zRot = new THREE.Quaternion().setFromAxisAngle(this.parentDirection, Math.PI);
            zRot.multiply(quaternion);
            quaternion = zRot;
        }

        var eulerRot = new THREE.Euler().setFromQuaternion(quaternion);
        mesh.rotation.set(eulerRot.x, eulerRot.y, eulerRot.z);
    };

    DMAFreeFormTetraCell.prototype.calcHighlighterPosition = function(face){

        var direction = face.normal.clone();
        direction.applyQuaternion(this.cellMesh.quaternion);

        var position = this.getPosition();
        var zScale = this.zScale();
        position.x += direction.x*zScale/2;
        position.y += direction.y*zScale/2;
        position.z += direction.z*zScale/2;

        return {index: _.clone(this.indices), direction:direction, position:position};
    };

    DMAFreeFormTetraCell.prototype._calcPosition = function(){
        var position = {};
        var zScale = this.zScale();
        position.x = this.parentPos.x+this.parentDirection.x*zScale/2;
        position.y = this.parentPos.y+this.parentDirection.y*zScale/2;
        position.z = this.parentPos.z+this.parentDirection.z*zScale/2;
        return position;
    };

    DMAFreeFormTetraCell.prototype.zScale = function(scale){
        if (!scale) scale = dmaGlobals.lattice.get("scale");
        return 2*scale/Math.sqrt(24);
    };

    DMAFreeFormTetraCell.prototype.toJSON = function(){
        var json = DMACell.prototype.toJSON.call(this);
        _.extend(json, {
            parentPosition: this.parentPos,
            parentOrientation: this.parentQuaternion,
            direction: this.parentDirection,
            parentType: this.parentType,
            type: "tetra"
        });
        return json;
    }

    self.DMAFreeFormTetraCell = DMAFreeFormTetraCell;


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

    DMAVertexOctaCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        return this._superBuildCellMesh(unitCellGeo);
    };

    DMAVertexOctaCell.prototype.calcHighlighterPosition = function(face, point){

        var position = this.getPosition();
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
        var mesh = this._superBuildCellMesh(unitCellGeo, cellMaterial);
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

    DMACubeCell.prototype._initParts = function(){
        return [];
    };

    DMACubeCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
        var mesh = this._superBuildCellMesh(unitCellGeo, cellMaterial);
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
