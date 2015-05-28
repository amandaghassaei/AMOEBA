/**
 * Created by aghassaei on 5/26/15.
 */


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
//        var geometry = new THREE.Geometry();
//        _.each(positions, function(position, index){
//            if (position == yPosition){
//                geometry.vertices.push(new THREE.Vector3(positions[index-1], yPosition, positions[index+1]));
//            }
//        });
//        console.log(geometry.vertices);
//        return new THREE.Line(geometry);
    };

    DMAGIKPart.prototype._getGeometry = function(){
        return unitPartGeo;//this.parentCell.getMaterialType()
    };

    DMAGIKPart.prototype.getMaterial = function(){
        return this.parentCell.getMaterial();
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

    DMAGIKPartLowPoly.prototype._getGeometry = function(){
        return unitPartGeo;
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

    DMAGIKEndPart.prototype._getGeometry = function(){
        return unitPartGeo;
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

    DMAGIKEndPartLowPoly.prototype._getGeometry = function(){
        return unitPartGeo;
    };

    self.DMAGIKEndPartLowPoly = DMAGIKEndPartLowPoly;

})();