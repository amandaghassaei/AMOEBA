/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'squareBaseplane'],
    function(_, Backbone, appState, lattice, three, THREE, SquareBasePlane){

    return SquareBasePlane.extend({

        calcHighlighterParams: function(face, point){
            var params = SquareBasePlane.prototype.calcHighlighterParams.call(this, face, point);
            params.position.x += lattice.xScale()/2;
            params.position.y += lattice.yScale()/2;
            return params;
        },

        nextCellPosition: function(highlighterPosition){
            highlighterPosition.x -= lattice.xScale()/2;
            highlighterPosition.y -= lattice.yScale()/2;//undo what we did in calc highlighter params
            var newPosition = highlighterPosition.clone().add(highlighterPosition.clone().sub(this.getAbsolutePosition()));
            return lattice.getIndexForPosition(newPosition);
        }

    });
});