/**
 * Created by aghassaei on 5/26/15.
 */


define(['cell'], function(DMACell){

    function OctaVertexCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    OctaVertexCell.prototype = Object.create(DMACell.prototype);

    OctaVertexCell.prototype._getGeometry = function(){
        return unitVertexOcta;
    };

    OctaVertexCell.prototype.calcHighlighterPosition = function(face, point){

        var position = this.getPosition();
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

        return {index: _.clone(this.index), direction:direction, position:position};
    };

    return OctaVertexCell;
});