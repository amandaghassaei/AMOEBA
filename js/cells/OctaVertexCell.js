/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));

    function OctaVertexCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    OctaVertexCell.prototype = Object.create(DMACell.prototype);

    OctaVertexCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    OctaVertexCell.prototype.calcHighlighterParams = function(face, point){

//        point.applyQuaternion(this.getAbsoluteOrientation());
        var position = this.getAbsolutePosition();
        var direction = null;

        var xScale = this.xScale();
        if (point.x < position.x+xScale/4 && point.x > position.x-xScale/4){
            if (point.y > position.y-xScale/4 && point.y < position.y+xScale/4){
                if (face.normal.z > 0) {
                    direction = new THREE.Vector3(0,0,1);
                    position.z += this.zScale()/2;
                }
                else {
                    direction = new THREE.Vector3(0,0,-1);
                    position.z -= this.zScale()/2;
                }
            } else {
                if (point.y < position.y-xScale/4){
                    direction = new THREE.Vector3(0,-1,0);
                    position.y -= xScale/2;
                } else {
                    direction = new THREE.Vector3(0,1,0);
                    position.y += xScale/2;
                }
            }
        } else {
            if (point.x < position.x-xScale/4){
                direction = new THREE.Vector3(-1,0,0);
                position.x -= xScale/2;
            } else {
                direction = new THREE.Vector3(1,0,0);
                position.x += xScale/2;
            }
        }

        return {direction:direction, position:position};
    };

    return OctaVertexCell;
});