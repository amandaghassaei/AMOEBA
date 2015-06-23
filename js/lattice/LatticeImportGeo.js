/**
 * Created by aghassaei on 6/23/15.
 */

define(['lattice', 'threeModel'], function(lattice, three){

    var importGeometryMethods = {

        //fill geometry

        subtractMesh: function(mesh){
            //todo this is specific to octa face

            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();

            var cells = this.cells;
            var cellsMin = this.get("cellsMin");

            var allVertexPos = mesh.geometry.attributes.position.array;

            var zHeight = 0;
            for (var x=0;x<cells.length;x++){
                for (var y=0;y<cells[0].length;y++){
                    var firstCell = null;
                    for (var z=0;z<cells[0][0].length;z++){
                        firstCell = cells[x][y][z];
                        if (firstCell) break;
                    }
                    if (!firstCell) continue;//nothing in col

                    var origin = this._positionForIndex(firstCell.indices);
    //                    firstCell._calcPosition(0, this._add({x:x,y:y,z:z}, cellsMin));
                    zHeight = this._findIntersectionsInWindow(xScale/2, yScale/2, origin, allVertexPos) || zHeight;

                    zHeight = Math.floor(zHeight/zScale);
                    for (var z=0;z<zHeight;z++){
                        var cell = cells[x][y][z];
                        if (cell) cell.destroy();
                        cells[x][y][z] = null;
                    }
                }

            }
            three.render();
        },

        _findIntersectionsInWindow: function(windowX, windowY, origin, allVertexPos){
            for (var i=0;i<allVertexPos.length;i+=3){
                if (allVertexPos[i] > origin.x-windowX && allVertexPos[i] < origin.x+windowX
                    && allVertexPos[i+1] > origin.y-windowY && allVertexPos[i+1] < origin.y+windowY){
                    return allVertexPos[i+2];
                }
            }
            return null
        }
    };

    _.extend(lattice, importGeometryMethods);

    return lattice;
});