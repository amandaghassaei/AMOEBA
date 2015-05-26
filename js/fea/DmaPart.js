/**
 * Created by aghassaei on 1/14/15.
 */


var partMaterial = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.FlatShading });
    partMaterial.color.setRGB( 0.9619657144369509, 0.6625466032079207, 0.20799727886007258 );

//a part, element with a single material, handled by assembler

    function DMAPart(type, parent) {
        this.parentCell = parent;//use this reference to get position and scale
        this.type = type;
    }

    DMAPart.prototype._draw = function(){
        if (this.mesh) console.warn("part mesh already in scene");
        this.mesh = this._makeMeshForType(this.type);
        var rotation = this.parentCell.getEulerRotation();
        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        this._setMeshPosition(this.parentCell.getPosition());
        globals.three.sceneAdd(this.mesh, "part");
    };

    DMAPart.prototype._setMeshPosition = function(position){
        var mesh = this.mesh;
        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;
    };

    DMAPart.prototype.moveTo = function(position, axis){//used for stock simulation
        this.mesh.position[axis] = position;
    };

    DMAPart.prototype.setVisibility = function(visibility){
        if (visibility) this._show();
        else this._hide();
    };

    DMAPart.prototype._show = function(){
        if (!this.mesh) this._draw();
        this.mesh.visible = true;
    };

    DMAPart.prototype._hide = function(){
        if (this.mesh) this.mesh.visible = false;
    };

    DMAPart.prototype.highlight = function(){
//        this.mesh.material.color.setRGB(1,0,0);
    };

    DMAPart.prototype.unhighlight = function(){
//        if (this.mesh) this.mesh.material.color.setRGB(0.9619657144369509, 0.6625466032079207, 0.20799727886007258);
    };

    DMAPart.prototype.removeFromCell = function(){//send message back to parent cell to destroy this
        if (this.parentCell) {
            this.parentCell.removePart(this.type);
            globals.three.render();
        } else console.warn("part has no parent cell");
    };

    DMAPart.prototype.destroy = function(){
        if (this.mesh) {
            globals.three.sceneRemove(this.mesh, "part");
            this.mesh.myPart = null;
//            this.mesh.dispose();
//            geometry.dispose();
//            material.dispose();
            this.mesh = null;
        }
        this.parentCell = null;
        this.type = null;
    };

    DMAPart.prototype.toJSON = function(){
        return {
        }
    };


//////////////////////////////////////////////////////////////
/////////////////TRIANGLE PART////////////////////////////////
//////////////////////////////////////////////////////////////


(function () {

    var unitPartGeo1, unitPartGeo2, unitPartGeo3;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/trianglePart.stl", function(geometry){

        unitPartGeo1 = geometry;
        unitPartGeo1.computeBoundingBox();
        var unitScale = 1.2/unitPartGeo1.boundingBox.max.y;
        unitPartGeo1.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        unitPartGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0.25,-0.6, -0.45));
        unitPartGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));

        unitPartGeo2 = unitPartGeo1.clone();
        unitPartGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(2*Math.PI/3));

        unitPartGeo3 = unitPartGeo1.clone();
        unitPartGeo3.applyMatrix(new THREE.Matrix4().makeRotationZ(-2*Math.PI/3));
    });

    function DMATrianglePart(type, parent){
        DMAPart.call(this, type, parent);
    }
    DMATrianglePart.prototype = Object.create(DMAPart.prototype);

    DMATrianglePart.prototype._makeMeshForType = function(type){
        var mesh;
        switch(type){
            case 0:
                mesh = new THREE.Mesh(unitPartGeo1, partMaterial);
                break;
            case 1:
                mesh = new THREE.Mesh(unitPartGeo2, partMaterial);
                break;
            case 2:
                 mesh = new THREE.Mesh(unitPartGeo3, partMaterial);
                break;
        }
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMATrianglePart = DMATrianglePart;

})();


//////////////////////////////////////////////////////////////
/////////////////EDGE VOX PART////////////////////////////////
//////////////////////////////////////////////////////////////



(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/edgeVoxPart.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        var unitScale = 0.706/unitPartGeo.boundingBox.max.y;
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,0.09));
    });

    function DMAEdgeVoxPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    DMAEdgeVoxPart.prototype = Object.create(DMAPart.prototype);

    DMAEdgeVoxPart.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(unitPartGeo, partMaterial);
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMAEdgeVoxPart = DMAEdgeVoxPart;

})();


(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/edgeVoxPartLowPoly.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        var unitScale = 0.706/unitPartGeo.boundingBox.max.y;
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    });

    function DMAEdgeVoxPartLowPoly(type, parent){
        DMAPart.call(this, type, parent);
    }
    DMAEdgeVoxPartLowPoly.prototype = Object.create(DMAPart.prototype);

    DMAEdgeVoxPartLowPoly.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(unitPartGeo, partMaterial);
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMAEdgeVoxPartLowPoly = DMAEdgeVoxPartLowPoly;

})();

//////////////////////////////////////////////////////////////
/////////////////Micro LEGO///////////////////////////////////
//////////////////////////////////////////////////////////////


(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/GIKPart.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-(unitPartGeo.boundingBox.min.x+unitPartGeo.boundingBox.max.x)/2,
            -(unitPartGeo.boundingBox.min.y+unitPartGeo.boundingBox.max.y)/2, -(unitPartGeo.boundingBox.min.z+unitPartGeo.boundingBox.max.z)/2));
        var unitScale = 1/(1.2699999809265137);
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    });

    function DMAGIKPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    DMAGIKPart.prototype = Object.create(DMAPart.prototype);

    DMAGIKPart.prototype._makeGikWireframe = function(positions, yPosition){
        var geometry = new THREE.Geometry();
        _.each(positions, function(position, index){
            if (position == yPosition){
                geometry.vertices.push(new THREE.Vector3(positions[index-1], yPosition, positions[index+1]));
            }
        });
        console.log(geometry.vertices);
        return new THREE.Line(geometry);
    };

    DMAGIKPart.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(unitPartGeo, this.parentCell.getMaterialType());



        mesh.myPart = this;//need a ref back to this part
        var wireframe = new THREE.EdgesHelper(mesh, 0x000000);
        mesh.children.push(wireframe);
        return mesh;
    };

    self.DMAGIKPart = DMAGIKPart;

})();

(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/GIKPartLowPoly.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-(unitPartGeo.boundingBox.min.x+unitPartGeo.boundingBox.max.x)/2,
            -(unitPartGeo.boundingBox.min.y+unitPartGeo.boundingBox.max.y)/2, -(unitPartGeo.boundingBox.min.z+unitPartGeo.boundingBox.max.z)/2));
        var unitScale = 1/(1.2699999809265137);
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    });

    function DMAGIKPartLowPoly(type, parent){
        DMAGIKPart.call(this, type, parent);
    }
    DMAGIKPartLowPoly.prototype = Object.create(DMAGIKPart.prototype);

    DMAGIKPartLowPoly.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(unitPartGeo, this.parentCell.getMaterialType());
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMAGIKPartLowPoly = DMAGIKPartLowPoly;

})();

(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/GIKEndPart.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-(unitPartGeo.boundingBox.min.x+0.5),
            -(unitPartGeo.boundingBox.min.y+unitPartGeo.boundingBox.max.y)/2, -(unitPartGeo.boundingBox.min.z+unitPartGeo.boundingBox.max.z)/2));
        var unitScale = 1/(1.2699999809265137);
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    });

    function DMAGIKEndPart(type, parent){
        DMAGIKPart.call(this, type, parent);
    }
    DMAGIKEndPart.prototype = Object.create(DMAGIKPart.prototype);

    DMAGIKEndPart.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(unitPartGeo, this.parentCell.getMaterialType());
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMAGIKEndPart = DMAGIKEndPart;

})();

(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/GIKEndPartLowPoly.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-(unitPartGeo.boundingBox.min.x+0.5),
            -(unitPartGeo.boundingBox.min.y+unitPartGeo.boundingBox.max.y)/2, -(unitPartGeo.boundingBox.min.z+unitPartGeo.boundingBox.max.z)/2));
        var unitScale = 1/(1.2699999809265137);
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    });

    function DMAGIKEndPartLowPoly(type, parent){
        DMAGIKPart.call(this, type, parent);
    }
    DMAGIKEndPartLowPoly.prototype = Object.create(DMAGIKPart.prototype);

    DMAGIKEndPartLowPoly.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(unitPartGeo, this.parentCell.getMaterialType());
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMAGIKEndPartLowPoly = DMAGIKEndPartLowPoly;

})();