/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

(function () {

    var octHeight = 3*30/8*Math.sqrt(5);//this isn't quite right

    var cellGeometry1 = new THREE.OctahedronGeometry(30/Math.sqrt(2));
    cellGeometry1.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    cellGeometry1.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    var cellGeometry2 = cellGeometry1.clone();

    cellGeometry1.applyMatrix(new THREE.Matrix4().makeTranslation(0,-30/Math.sqrt(3),octHeight/2));
    cellGeometry2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
    cellGeometry2.applyMatrix(new THREE.Matrix4().makeTranslation(0,30/Math.sqrt(3),octHeight/2));

    var cellMaterials = [new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];


    function DMACell(mode, position, indices) {

        this.position = position;
        this.indices = indices;
        this.parts = this._initParts();


        this.drawForMode(mode);
    }

    DMACell.prototype._initParts = function(){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new DMAPart(i));
        }
        return parts;
    };

    DMACell.prototype._buildPartsMesh = function(position){
        var parts  = [];
        for (var i=0;i<nodes.length;i++){
            parts.push(new Part(nodes[i], config[i]));
        }
        return parts;
    };

    DMACell.prototype._buildCellMesh = function(position){//abstract mesh representation of cell

        var mesh;

        if (Math.round(position.z/octHeight)%2==0){
            mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry1, cellMaterials);
        } else {
            mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry2, cellMaterials);
        }
        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;

        mesh.myCell = this;//we need a reference to this instance from the mesh for intersection selection stuff
        return mesh;
    };

    DMACell.prototype.drawForMode = function(mode){
        position = this.position;
        if (mode == "cell"){
            if (this.cellMesh) this._setCellMeshVisibility(true);
            else {
                this.cellMesh = this._buildCellMesh(position);
                window.three.sceneAdd(this.cellMesh);
            }
        } else if (mode == "parts"){
            if (this.cellMesh) this._setCellMeshVisibility(false);
            else {
//                this.parts = this._buildPartsMesh();
//                window.three.sceneAdd(this.parts);
            }
        } else {
            console.warn("unrecognized draw mode for cell");
        }
    };

    DMACell.prototype._setCellMeshVisibility = function(visibility){
        if (!this.cellMesh) return;
        this.cellMesh.visible = visibility;
//        _.each(this.cellMesh.children, function(childMesh){
//            childMesh.visible = visibility;
//        });
    };

    DMACell.prototype.remove = function(){
        if (this.cellMesh) window.three.sceneRemove(this.cellMesh);
    };

    DMACell.prototype._destroy = function(){
        if (this.cellMesh) this.cellMesh.myCell = null;
    };

    self.DMACell =  DMACell;

})();
