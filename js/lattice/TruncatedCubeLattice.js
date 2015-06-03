/**
 * Created by aghassaei on 5/26/15.
 */


define(['lattice', 'globals'], function(lattice, globals){

    var TruncatedCubeLattice = {

        _initLatticeType: function(){
            require(['squareBaseplane'], function(SquareBasePlane){
                globals.basePlane = new SquareBasePlane();
            });
            require(['truncatedCubeHighlighter'], function(TruncatedCubeHighlighter){
                globals.highlighter = new TruncatedCubeHighlighter();
            });
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return Math.sqrt(2)+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation);
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return Math.sqrt(2)+2*cellSeparation;
        },

        makeCellForLatticeType: function(indices){
            require(['truncatedCubeCell'], function(TruncatedCubeCell){
                return new TruncatedCubeCell(indices);
            });
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(TruncatedCubeLattice), function(key){
                self[key] = null;
            });
        }
    };

    return TruncatedCubeLattice;
});
