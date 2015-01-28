/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler

(function () {

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.addEventListener('load', onMeshLoad);
    loader.load("data/trianglePart.stl");

    var unitPartGeo;
    var partGeometry;
    var globalPartScale = 30;
    function onMeshLoad(e){
        console.log("part loaded");
        unitPartGeo = e.content;
        unitPartGeo.dynamic = true;
        unitPartGeo.computeBoundingBox();
        var unitScale = 1/unitPartGeo.boundingBox.max.y;
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0.2,-0.5, 0));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));
        setGlobalPartScale(globalPartScale)
    }

    function setGlobalPartScale(scale){
        globalPartScale = scale;
        partGeometry = unitPartGeo.clone();
        partGeometry.applyMatrix(new THREE.Matrix4().makeScale(scale,scale,scale));
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
        mesh = this._setMeshPosition(mesh, 30);

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

    DMAPart.prototype._setMeshPosition = function(mesh, scale, position){
        position = position || this.position;
        mesh.position.x = position.x;
        mesh.position.y = -scale/3*Math.sqrt(3)+position.y;
        mesh.position.z = position.z;

        if (this.oddZFlag){//adjust some offsets for odd z layers
            mesh.position.y += 7*scale/6;
            mesh.rotateZ(Math.PI);
        }
        return mesh;
    };

    DMAPart.prototype.changeScale = function(scale, position){
        if (globalPartScale != scale) setGlobalPartScale(scale);
        this.position = position;
        if (this.mesh) {
            this._setMeshPosition(this.mesh, scale, position);
            this.mesh.geometry.vertices = partGeometry.vertices;
            this.mesh.geometry.verticesNeedUpdate = true;
        }
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