/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'baseplane'],
    function(_, Backbone, appState, lattice, three, THREE, BasePlane){

    return BasePlane.extend({

        _makeBasePlaneMesh: function(){

            var geometry = new THREE.Geometry();
            geometry.vertices = this._calcOctaFaceVertices(0.0);
            var faces = geometry.faces;

            var dimX = this.get("dimX");
            var dimY = this.get("dimY");

            var currentOffset = 0;
            for (var j=-dimX;j<=dimX;j++){
                for (var i=-dimY;i<=dimY;i++){

                    currentOffset++;
                    if (j == -dimX || i == -dimY) continue;

                    if (Math.abs(j)%2==1){
                        faces.push(new THREE.Face3(3*currentOffset-4, 3*currentOffset-8-6*dimY, 3*currentOffset-6-6*dimY));//pt, base, base
                    } else {
                        faces.push(new THREE.Face3(3*currentOffset-1, 3*currentOffset-8-6*dimY, 3*currentOffset-6-6*dimY));//pt, base, base
                    }

                }

            }

            geometry.computeFaceNormals();
            return [new THREE.Mesh(geometry, this.get("material"))];
        },

//        _renderZIndexChange: function(){
//            var zIndex = this.get("zIndex");
//            var xScale = lattice.xScale();
//            var yScale = lattice.yScale();
//            var zScale = lattice.zScale();
//
//            _.each(this.get("mesh"), function(mesh){
//                mesh.position.set(xScale*(zIndex%2)/2, -yScale/3*(zIndex%2), zIndex*zScale);
//                mesh.rotation.set(Math.PI*(zIndex%2),0,0)
//            });
//            three.render();
//        },

        _calcOctaFaceVertices: function(xySep){

            var vertices = [];

            var xScale = lattice.xScale();
            var yScale = lattice.yScale();

            var dimX = this.get("dimX");
            var dimY = this.get("dimY");

            var baseVertOffset = xySep/Math.sqrt(3);
            var pointVertOffset = 2*baseVertOffset;
            var horizontalOffset = xySep;

            for (var j=-dimX;j<=dimX;j++){
                for (var i=-dimY;i<=dimY;i++){

                    var xOffset = 0;
                    if (Math.abs(j)%2!=0) {
                        xOffset = 1/2*xScale;
                    }

                    vertices.push(new THREE.Vector3(i*xScale + xOffset - horizontalOffset, j*yScale + baseVertOffset, 0));
                    vertices.push(new THREE.Vector3(i*xScale + xOffset + horizontalOffset, j*yScale + baseVertOffset, 0));
                    vertices.push(new THREE.Vector3(i*xScale + xOffset, j*yScale - pointVertOffset, 0));

                }

            }
            return vertices;
        },

        updateXYSeparation: function(xySep){
            var geometry = this.get("mesh")[0].geometry;
            geometry.vertices = this._calcOctaFaceVertices(xySep);
            geometry.verticesNeedUpdate = true;
        },

        calcHighlighterParams: function(face, point){
            point.z = 0;
            var index = lattice.getIndexForPosition(point);
            if (index.z%2 != 0) index.x -= 1;
            return BasePlane.prototype.calcHighlighterParams.call(this, face, point, index);
        }
    });
});