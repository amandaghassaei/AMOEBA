/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler

(function () {

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.addEventListener('load', onMeshLoad);
    loader.load("data/trianglePart.stl");

    var partGeometry;
    function onMeshLoad(e){
        console.log("part loaded");
        partGeometry = e.content;
        partGeometry.computeBoundingBox();
        var unitScale = 1/partGeometry.boundingBox.max.y;
        partGeometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        partGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.2,-0.5, 0));
        partGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));
        partGeometry.applyMatrix(new THREE.Matrix4().makeScale(30,30,30));
    }

    function DMAPart(type, position, oddZFlag) {
        this.position = position;
        this.oddZFlag = oddZFlag;//this tells me if cell is at an odd z height in lattice, everything needs to rotate 180
        this.type = type;
    }

    DMAPart.prototype._draw = function(){
        this.mesh = this._makeMeshForType(this.type);
        window.three.sceneAdd(this.mesh, false);
    };

    DMAPart.prototype._makeMeshForType = function(type){

        var mesh = new THREE.Mesh(partGeometry);
        mesh.position.x = this.position.x;
        mesh.position.y = -30/3*Math.sqrt(3)+this.position.y;
        mesh.position.z = this.position.z;

        if (this.oddZFlag){//adjust some offsets for odd z layers
            mesh.position.y += 30 + 30/6;
            mesh.rotateZ(Math.PI);
        }

        switch(type){
            case 1:
                mesh.rotateZ(2*Math.PI/3);
                break;
            case 2:
                mesh.rotateZ(-2*Math.PI/3);
                break;
        }
        return mesh;
    };

    DMAPart.prototype.show = function(){
        if (!this.mesh) this._draw();
        this.mesh.visible = true;
    };

    DMAPart.prototype.hide = function(){
        if (this.mesh) this.mesh.visible = false;
    };

    self.DMAPart =  DMAPart;

})();

//////////////////////////////////////////////////////////////
/////////////////SUBCLASSES///////////////////////////////////
//////////////////////////////////////////////////////////////



////matt's part
//function PartTriangle(){
//}
//
//PartTriangle.prototype = new DmaPart();