/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.Geometry();
    unitGeo.vertices = [
        new THREE.Vector3(0.7071067811865475, 0, 0),
        new THREE.Vector3(-0.7071067811865475, 0, 0),
        new THREE.Vector3(0, 0.7071067811865475, 0),
        new THREE.Vector3(0, -0.7071067811865475, 0),
        new THREE.Vector3(0, 0, 0.7071067811865475),
        new THREE.Vector3(0, 0, -0.7071067811865475)
    ];

    unitGeo.faces = [
        new THREE.Face3(2, 4, 0),
        new THREE.Face3(4, 3, 0),
        new THREE.Face3(3, 5, 0),
        new THREE.Face3(5, 2, 0),
        new THREE.Face3(2, 5, 1),
        new THREE.Face3(5, 3, 1),
        new THREE.Face3(3, 4, 1),
        new THREE.Face3(4, 2, 1)
    ];
    unitGeo.computeFaceNormals();

    function OctaVertexCell(json, superCell){
        DMACell.call(this, json, superCell);
    }
    OctaVertexCell.prototype = Object.create(DMACell.prototype);

    OctaVertexCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    OctaVertexCell.prototype._initParts = function(callback){
        var self = this;
        require([lattice.get("partType") + "Part"], function(PartClass){
            var parts  = [];
            for (var i=0;i<3;i++){
                parts.push(new PartClass(0, self));
            }
            callback(parts);
        });
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