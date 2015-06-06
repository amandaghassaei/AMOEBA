/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'squareBaseplane'],
    function(_, Backbone, appState, lattice, three, THREE, SquareBasePlane){

    return SquareBasePlane.extend({

        calcHighlighterParams: function(face, point){
            var params = SquareBasePlane.prototype.calcHighlighterParams.call(this, face, point);
            params.position.x -= lattice.xScale()/2;
            params.position.y -= lattice.yScale()/2;
            params.position.z -= lattice.zScale()/2;
            return params;
        }
    });
});