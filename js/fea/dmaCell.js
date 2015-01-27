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

    function Cell(mode, position) {

        this.position = position;
        this.drawForMode(mode, position);

    //    this.parts = this._createParts(nodes, config);
    }

    Cell.prototype._buildPartsMesh = function(){
//        var parts  = [];
//        for (var i=0;i<nodes.length;i++){
//            parts.push(new Part(nodes[i], config[i]));
//        }
//        return parts;
        return null;
    };

    Cell.prototype._buildCellMesh = function(position){//abstract mesh representation of cell

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

    Cell.prototype._draw = function(){
        window.three.sceneAdd(this.mesh);
    };

    Cell.prototype.drawForMode = function(mode, position){
        if (this.mesh) this.remove();
        this.mesh = null;
        position = position || this.position;
        if (mode == "cell"){
            this.mesh = this._buildCellMesh(position);
        } else if (mode == "parts"){
            this.mesh = this._buildPartsMesh();
        } else {
            console.warn("unrecognized draw mode for cell");
        }
        if (this.mesh) this._draw();
    };

    Cell.prototype.remove = function(){
        window.three.sceneRemove(this.mesh);
    };


    Cell.prototype.translate = function(dx, dy, dz){
    };

    Cell.prototype.rotate = function(rx, ry, rz){
    };

    Cell.prototype._destroy = function(){
        this.mesh.myCell = null;
    }



    self.Cell =  Cell;

})();
