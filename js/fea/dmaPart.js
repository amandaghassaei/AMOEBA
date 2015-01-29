/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler

(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("data/trianglePart.stl", function(geometry){
        console.log("part loaded");
        unitPartGeo = geometry
        unitPartGeo.dynamic = true;
        unitPartGeo.computeBoundingBox();
        var unitScale = 1/unitPartGeo.boundingBox.max.y;
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0.2,-0.5, 0));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));
        unitPartGeo.dynamic = true;
    });

    var partMaterial = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.FlatShading });
    partMaterial.color.setRGB( 0.9619657144369509, 0.6625466032079207, 0.20799727886007258 );

    function DMAPart(type, oddZFlag, parent) {
        this.parentCell = parent;//use this reference to get position and scale
        this.oddZFlag = oddZFlag;//this tells me if cell is at an odd z height in lattice, everything needs to rotate 180
        this.type = type;
    }

    DMAPart.prototype._draw = function(){
        this.mesh = this._makeMeshForType(this.type);
        window.three.sceneAdd(this.mesh, false);
    };

    DMAPart.prototype._makeMeshForType = function(type){

        var mesh = new THREE.Mesh(unitPartGeo, partMaterial);
        mesh = this._setMeshPosition(mesh);
        mesh = this._setMeshScale(mesh);

        switch(type){
            case 1:
                mesh.rotateZ(2*Math.PI/3);
                break;
            case 2:
                mesh.rotateZ(-2*Math.PI/3);
                break;
        }
        if (this.oddZFlag) mesh.rotateZ(Math.PI);
        return mesh;
    };

    DMAPart.prototype._setMeshPosition = function(mesh, scale, position){
        position = position || this.parentCell.position;
        scale = scale || this.parentCell.getScale();
        mesh.position.x = position.x;
        mesh.position.y = -scale/3*Math.sqrt(3)+position.y;
        mesh.position.z = position.z;

        if (this.oddZFlag){//adjust some offsets for odd z layers
            mesh.position.y += 7*scale/6;
        }
        return mesh;
    };

    DMAPart.prototype._setMeshScale = function(mesh, scale){
        scale = scale || this.parentCell.getScale();
        mesh.scale.set(scale, scale, scale);
        return mesh;
    };

    DMAPart.prototype.changeScale = function(scale, position){
        this.position = position;
        if (this.mesh) {
            this._setMeshPosition(this.mesh, scale, position);
            this._setMeshScale(this.mesh, scale);
        }
    };

    DMAPart.prototype.show = function(){
        if (!this.mesh) this._draw();
        this.mesh.visible = true;
    };

    DMAPart.prototype.hide = function(){
        if (this.mesh) this.mesh.visible = false;
    };

    DMAPart.prototype._destroy = function(){
        this.parentCell = null;
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