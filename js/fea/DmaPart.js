/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler

(function () {

    var unitPartGeo1, unitPartGeo2, unitPartGeo3, unitPartGeo4, unitPartGeo5,unitPartGeo6;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("data/trianglePart.stl", function(geometry){
        console.log("part loaded");
        unitPartGeo1 = geometry
        unitPartGeo1.dynamic = true;
        unitPartGeo1.computeBoundingBox();
        var unitScale = 1/unitPartGeo1.boundingBox.max.y;
        unitPartGeo1.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        unitPartGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0.2,-0.5, 0));
        unitPartGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));
        unitPartGeo1.dynamic = true;
        
        unitPartGeo2 = unitPartGeo1.clone();
        unitPartGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(2*Math.PI/3));

        unitPartGeo3 = unitPartGeo1.clone();
        unitPartGeo3.applyMatrix(new THREE.Matrix4().makeRotationZ(-2*Math.PI/3));
        
        unitPartGeo4 = unitPartGeo1.clone();
        unitPartGeo4.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));

        unitPartGeo5 = unitPartGeo2.clone();
        unitPartGeo5.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));

        unitPartGeo6 = unitPartGeo3.clone();
        unitPartGeo6.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
    });

    var partMaterial = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.FlatShading });
    partMaterial.color.setRGB( 0.9619657144369509, 0.6625466032079207, 0.20799727886007258 );

    function DMAPart(type, oddZFlag, parent) {
        //todo remove this?
        this.parentCell = parent;//use this reference to get position and scale
        this.oddZFlag = oddZFlag;//this tells me if cell is at an odd z height in lattice, everything needs to rotate 180
        this.type = type;
    }

    DMAPart.prototype._draw = function(){
        if (this.mesh) console.warn("part mesh already in scene");
        this.mesh = this._makeMeshForType(this.type);
        window.three.sceneAdd(this.mesh, "part");
    };

    DMAPart.prototype._makeMeshForType = function(type){
        var mesh;
        switch(type){
            case 0:
                if (this.oddZFlag) mesh = new THREE.Mesh(unitPartGeo4, partMaterial.clone());
                else mesh = new THREE.Mesh(unitPartGeo1, partMaterial.clone());
                break;
            case 1:
                if (this.oddZFlag) mesh = new THREE.Mesh(unitPartGeo5, partMaterial.clone());
                else mesh = new THREE.Mesh(unitPartGeo2, partMaterial.clone());
                break;
            case 2:
                if (this.oddZFlag) mesh = new THREE.Mesh(unitPartGeo6, partMaterial.clone());
                else mesh = new THREE.Mesh(unitPartGeo3, partMaterial.clone());
                break;
        }
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    DMAPart.prototype._setMeshPosition = function(mesh, scale, position){
        mesh.position.x = position.x;
        mesh.position.y = -scale/3*Math.sqrt(3)+position.y;
        mesh.position.z = position.z;
        if (this.oddZFlag){//adjust some offsets for odd z layers
            mesh.position.y += 7*scale/6;
        }
        return mesh;
    };

    DMAPart.prototype.updateForScale = function(scale, position){
        if (this.mesh) {
            this.mesh.scale.set(scale, scale, scale);
            this._setMeshPosition(this.mesh, scale, position);
        }
    };

    DMAPart.prototype.show = function(){
        if (!this.mesh) this._draw();
        this.mesh.visible = true;
    };

    DMAPart.prototype.hide = function(){
        if (this.mesh) this.mesh.visible = false;
    };

    DMAPart.prototype.highlight = function(){
        this.mesh.material.color.setRGB(1,0,0);
    };

    DMAPart.prototype.unhighlight = function(){
        if (this.mesh) this.mesh.material.color.setRGB(0.9619657144369509, 0.6625466032079207, 0.20799727886007258);
    };

    DMAPart.prototype.removeFromCell = function(){//send message back to parent cell to destroy this
        if (this.parentCell) {
            this.parentCell.removePart(this.type);
            window.three.render();
        } else console.warn("part has no parent cell");
    };

    DMAPart.prototype.destroy = function(){
        if (this.mesh) {
            window.three.sceneRemove(this.mesh, "part");
            this.mesh.myPart = null;
//            this.mesh.dispose();
//            geometry.dispose();
//            material.dispose();
            this.mesh = null;
        }
        this.parentCell = null;
        this.oddZFlag = null;
        this.type = null;
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