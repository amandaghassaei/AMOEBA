/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

(function () {

    var cellGeometry = new THREE.OctahedronGeometry(30/Math.sqrt(2));
    cellGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    cellGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));
    cellGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-30/Math.sqrt(3)/2,30/2));



    var cellMaterials = [new THREE.MeshNormalMaterial(), new THREE.MeshBasicMaterial({color:0x000000, wireframe:true})];

    function Cell() {

        this.mesh = THREE.SceneUtils.createMultiMaterialObject(cellGeometry, cellMaterials);
    //    this.parts = this._createParts(nodes, config);
    }

    //Cell.prototype._createParts = function(nodes, config){
    //    var parts  = [];
    //    for (var i=0;i<nodes.length;i++){
    //        parts.push(new Part(nodes[i], config[i]));
    //    }
    //    return parts;
    //};

    Cell.prototype.draw = function(){
        window.three.sceneAdd(this.mesh);
    };

    Cell.prototype.remove = function(){
        window.three.sceneRemove(this.mesh);
    };


    Cell.prototype.translate = function(dx, dy, dz){
    };

    Cell.prototype.rotate = function(rx, ry, rz){
    };



    self.Cell =  Cell;

})();
