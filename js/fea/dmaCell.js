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

    var cellMaterials = [new THREE.MeshNormalMaterial(), new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

    function Cell(position) {

        if (Math.round(position.z/octHeight)%2==0){
            this.mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry1, cellMaterials);
        } else {
            this.mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry2, cellMaterials);
        }
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;

        this.mesh.myCell = this;//we need a reference to this instance from the mesh for

        this._draw();

    //    this.parts = this._createParts(nodes, config);
    }

    //Cell.prototype._createParts = function(nodes, config){
    //    var parts  = [];
    //    for (var i=0;i<nodes.length;i++){
    //        parts.push(new Part(nodes[i], config[i]));
    //    }
    //    return parts;
    //};

    Cell.prototype._draw = function(){
        window.three.sceneAdd(this.mesh);
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
