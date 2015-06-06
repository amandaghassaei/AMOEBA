/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));

    function OctaRotEdgeCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    OctaRotEdgeCell.prototype = Object.create(DMACell.prototype);

    OctaRotEdgeCell.prototype._initParts = function(){
        var type = globals.lattice.get("partType");
        var newParts = [];
        if (type == "vox"){
            newParts.push(new OctaEdgeVoxPart(0, this));
        } else if (type == "voxLowPoly"){
            newParts.push(new OctaEdgeVoxPartLowPoly(0, this));
        } else {
            console.warn("part type " + type + " not recognized");
            return;
        }
        return newParts;
    };

    OctaRotEdgeCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    OctaRotEdgeCell.prototype.calcHighlighterParams = function(face, point){

//        point.applyQuaternion(this.getAbsoluteOrientation());
        var position = this.getAbsolutePosition();
        var direction = new THREE.Vector3(0,0,0);
        var rad = this.xScale()*Math.sqrt(2)/6;

        var difference = new THREE.Vector3().subVectors(position, point);
        difference.divideScalar(this.zScale());
        if (Math.abs(difference.z) < 0.2){
            direction.z = 0;
        } else if (point.z < position.z) {
            direction.z = -1;
            position.z -= rad;
        } else {
            direction.z = 1;
            position.z += rad;
        }

        if (direction.z != 0){
            if (this.index.z%2 == 0){
                if (point.x < position.x) {
                    direction.x -= 1;
                    position.x -= rad;
                }
                else position.x += rad;
                if (point.y < position.y) {
                    direction.y -= 1;
                    position.y -= rad;
                }
                else position.y += rad;
            } else {
                if (point.x > position.x) {
                    direction.x += 1;
                    position.x += rad;
                }
                else position.x -= rad;
                if (point.y > position.y) {
                    direction.y += 1;
                    position.y += rad;
                }
                else position.y -= rad;
            }
        } else {
            if (Math.abs(difference.x) > Math.abs(difference.y)){
                if (point.x > position.x) direction.x = 1;
                else direction.x = -1;
            } else {
                if (point.y > position.y) direction.y = 1;
                else direction.y = -1;
            }
            position.x += direction.x*this.xScale()/2;
            position.y += direction.y*this.yScale()/2;
        }

        return {direction:direction, position:position};
    };

    return OctaRotEdgeCell;
});