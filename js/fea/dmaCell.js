/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

(function () {

    var unitOctHeight = 2/Math.sqrt(6);

    var unitCellGeo1 = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitCellGeo1.dynamic = true;
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    var unitCellGeo2 = unitCellGeo1.clone();

    unitCellGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0,-1/Math.sqrt(3),unitOctHeight/2));
    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
    unitCellGeo2.applyMatrix(new THREE.Matrix4().makeTranslation(0,1/Math.sqrt(3),unitOctHeight/2));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

    var cellGeometry1;
    var cellGeometry2;

    var globalCellScale = window.defaultLatticeScale;

    setGlobalCellScale(globalCellScale);

    function setGlobalCellScale(scale){
        globalCellScale = scale;
        cellGeometry1 = unitCellGeo1.clone();
        cellGeometry1.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
        cellGeometry2 = unitCellGeo2.clone();
        cellGeometry2.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
    }

    function DMACell(mode, indices, scale, lattice) {

        this.indices = indices;
        this.scale = scale;
        this.lattice = lattice;//need ref back to lattice
        this.position = this._calcPosition(scale, indices);
        this.cellMesh = this._buildCellMesh(this.position, indices.z);
        window.three.sceneAdd(this.cellMesh, "cell");

        this.parts = this._initParts(this.position, indices.z);
        this.drawForMode(mode);
    }

    DMACell.prototype._calcPosition = function(scale, indices){
        var position = {};
        var octHeight = 2*scale/Math.sqrt(6);
        var triHeight = scale/2*Math.sqrt(3);
        position.x = indices.x*scale;
        position.y = indices.y*triHeight;
        position.z = indices.z*octHeight;
        if (Math.abs(indices.y%2) == 1) position.x -= scale/2;
        if (Math.abs(indices.z%2) == 1) position.y -= triHeight*4/3;
        return position;
    };

    DMACell.prototype._initParts = function(position, zIndex){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMAPart(i, zIndex%2==1, this));
        }
        return parts;
    };

    DMACell.prototype.removePart = function(index){
        this.parts[index].destroy();
        this.parts[index] = null;
        var hasAnyParts = false;
        _.each(this.parts, function(part){
            if (part) hasAnyParts = true;
        });
        if (!hasAnyParts) this.lattice.removeCell(this);
    };

    DMACell.prototype._buildCellMesh = function(position, zIndex){//abstract mesh representation of cell

        var mesh;

        if (zIndex%2==0){
            mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry1, cellMaterials);
        } else {
            mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry2, cellMaterials);
        }
        mesh = this._setMeshPosition(mesh, position);

        mesh.myCell = this;//we need a reference to this instance from the mesh for intersection selection stuff
        return mesh;
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

    DMACell.prototype.changeScale = function(scale){

        this.scale = scale;

        //update geometry
        if (globalCellScale != scale) {
            setGlobalCellScale(scale);
        }
        if (this.indices.z%2==0){
            this._updateVertices(cellGeometry1.vertices);
        } else {
            this._updateVertices(cellGeometry2.vertices);
        }

        this.position = this._calcPosition(scale, this.indices);
        this._setMeshPosition(this.cellMesh, this.position);
        _.each(this.parts, function(part){
                if (part) part.changeScale(scale, this.position);
         });
    };

    DMACell.prototype._updateVertices = function(vertices){
        _.each(this.cellMesh.children, function(mesh){
            mesh.geometry.vertices = vertices;
            mesh.geometry.verticesNeedUpdate = true;
        });
    };

    DMACell.prototype.getScale = function(){
         return this.scale;//I don't like this stored here
     };

    DMACell.prototype.destroy = function(){
        if (this.cellMesh) {
            window.three.sceneRemove(this.cellMesh, "cell");
            this.cellMesh.myCell = null;
//            this.cellMesh.dispose();
//            geometry.dispose();
//            material.dispose();
            this.cellMesh = null;
        }
        _.each(this.parts, function(part){
            if (part) part.destroy();
        });
        this.indices = null;
        this.scale = null;
        this.position = null;
        this.lattice = null;
        this.parts = null;
    };

    self.DMACell =  DMACell;

})();
